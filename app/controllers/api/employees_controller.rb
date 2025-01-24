# frozen_string_literal: true

class Api::EmployeesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :find_employee, only: %i(update destroy locations)
  before_action :find_employee_to_be_updated, only: %i(update_inventories send_reset_password_link)

  def index
    type = params[:type].to_s.downcase
    result = Employee.order(:name).fetch_employees_with_associations(
      type: type,
      mentor_for_employee_id: params[:mentor_for_employee_id]
    )

    if result.is_a?(Hash) && result[:error].present?
      render json: result, status: :bad_request
    else
      render json: result, status: :ok
    end
  end

  def show
    if current_employee.present?
      employee = Employee.get_employee(current_employee.id)
      render json: employee, status: :ok
    end
  end

  def create
    @employee = Employee.new(employee_params)
    default_role = Role.find_by(name: "mentor")
    @employee.roles << default_role if default_role.present? && @employee.roles.empty?
    if @employee.save
      begin
        @employee.send_reset_password_mail
        render json: { message: 'Employee and Stripe account created successfully', employee: @employee}, status: :created
      rescue => e
        @employee.destroy
        render json: { error: "Employee creation failed: #{e.message}" }, status: :unprocessable_entity
      end
    else
      render json: { error: @employee.errors.full_messages }, status: :unprocessable_entity
    end
  end


  def locations
    locations = @employee.locations

    render json: locations, status: :ok
  end

  def destroy
    if @employee.destroy!
      render json: {'message' => 'Employee deleted successfully!'}, status: :ok
    else
      render json: { 'error': 'Record Not found' }, status: :bad_request
    end
  end

  def send_reset_password_link
    if @selected_employee
      @selected_employee.send_reset_password_mail
    else
      render json: { 'error': 'Record Not found' }, status: :bad_request
    end
  end

  def reset_password
    @employee = Employee.where('lower(email) = ?', params[:email].downcase)
    if @employee
      if compare_passwords
        @employee.update!(password: params[:password])
        render json: @employee, status: :ok
      else 
        render json: {'error' => 'Passwords do not match, please try again.'}, status: 302
      end
    else
      render json: {'error' => 'Email is not found in our database, please try again.'}, status: :ok
    end
  end

  def update
    if @employee.update!(employee_params)
      render json: @employee, status: :ok
    else
      render json: {'error' => 'Could not upload the employee'}, status: :bad_request
    end
  end

  def update_inventories
    params[:updated_products].each do |product_id, quantity_hash|
      product = Product.find_by(id: product_id)
      emp_inventory = @selected_employee.employees_inventories.where(product_id: product_id).first
      emp_inventory_previous_quantity = emp_inventory.quantity.to_f
      emp_inventory.update(quantity: quantity_hash["quantity"].to_f)

      main_inventory = Inventory.find_or_create_by(product: product)

      main_inventory.quantity = if emp_inventory_previous_quantity > quantity_hash["quantity"].to_f
        main_inventory.quantity.to_f + (emp_inventory_previous_quantity.to_f - quantity_hash["quantity"].to_f)
      else
        main_inventory.quantity.to_f - (quantity_hash["quantity"].to_f - emp_inventory_previous_quantity.to_f)
      end

      main_inventory.save
      text = "#{current_employee.name.capitalize} updated Quantity of #{product.name} from #{quantity_hash["quantity"]} for #{@selected_employee.name.capitalize}."
      send_message(text: text)
    end

    params["new_products"].each do |product|
      record = Product.where(name: product["product_name"]).first
      @selected_employee.employees_inventories
        .create!(product: record, quantity: product["quantity"])

      main_inventory = Inventory.where(product: Product.where(name: product["product_name"])).first
      main_inventory.quantity -= product["quantity"].to_f
      main_inventory.save

      text = "#{current_employee.name.capitalize} added #{product["quantity"]} of #{record.name} for #{@selected_employee.name.capitalize}."
      send_message(text: text)
    end
  end

  def mentors
    mentors = Employee.select(&:is_mentor?)

    render json: mentors, only: [:id, :name]
  end

  def update_plan
    @employee = Employee.find_by(id: params[:id])

    if @employee.update(plan: params[:plan])
      render json: { success: true, plan: @employee.plan }
    else
      render json: { success: false, error: @employee.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def employee_stripe_connect
    employee = Employee.find_by(id: params[:employee_id])

    if employee.nil?
      render json: { error: 'Employee not found' }, status: :not_found
      return
    end

    if employee.stripe_account_id.present?
      render json: { error: 'Stripe account already exists for this employee' }, status: :unprocessable_entity
      return
    end

    begin
      redirect_url = create_stripe_account(employee)
      render json: { message: 'Stripe account created successfully', redirect_url: redirect_url }, status: :ok
    rescue StandardError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def stripe_onboarding_complete
    employee_id = params[:employee_id]
    stripe_account_id = params[:stripe_account_id]

    employee = Employee.find_by(id: employee_id)

    if employee.nil?
      render json: { error: 'Employee not found' }, status: :not_found
      return
    end

    if stripe_account_id.nil?
      render json: { error: 'Stripe account ID is missing' }, status: :unprocessable_entity
      return
    end

    employee.update(stripe_account_id: stripe_account_id)

    render json: { message: 'Stripe account linked successfully', employee_id: employee.id, stripe_account_id: stripe_account_id }, status: :ok
  end

  def stripe_account_details
    employee = Employee.find(params[:employee_id])
    stripe_account_id = employee.stripe_account_id
    begin
      account = Stripe::Account.retrieve(stripe_account_id)
      bank_accounts = account.external_accounts.data

      bank_account_details = bank_accounts.map do |bank_account|
        {
          id: bank_account.id,
          bank_name: bank_account.bank_name,
          last4: bank_account.last4,
          routing_number: bank_account.routing_number,
          status: bank_account.status
        }
      end

      render json: { bank_accounts: bank_account_details }, status: :ok
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
    
  end

  private

  def create_stripe_account(employee)
    if employee.stripe_account_id.present?
      raise StandardError, 'Stripe account already exists for this employee'
    end

    account = Stripe::Account.create({
      type: 'express',
      country: 'US',
      email: employee.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true }
      }
    })

    return_url = "#{request.base_url}/stripe-onboard-success/#{employee.id}/#{account.id}"
    account_link = Stripe::AccountLink.create({
      account: account.id,
      refresh_url: "#{request.base_url}/myprofile",
      return_url: return_url,
      type: 'account_onboarding'
    })
    account_link.url
  end

  def employee_params
    params.permit(:name, :vendor_name, :email, :password, :gfe, :service_percentage, :retail_percentage, :is_admin, :is_inv_manager, :is_mentor, :pay_50, :profile_photo, employee_mentors_attributes: [:id, :employee_id, :mentor_id, :mentor_percentage, :_destroy], employee_locations_attributes: [:id, :employee_id, :location_id, :_destroy])
  end

  def find_employee
    @employee = Employee.find_by(id: params[:id] || session[:employee_id]) 
  end

  def find_employee_to_be_updated
    @selected_employee = Employee.find_by(id: params[:id])
  end

  def compare_passwords
    params[:password] == params[:confirmPassword] 
  end
end
  
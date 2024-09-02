# frozen_string_literal: true

class Api::EmployeesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :find_employee, only: %i(update destroy locations)
  before_action :find_employee_to_be_updated, only: %i(update_inventories send_reset_password_link)

  def index
    type = params[:type].to_s.downcase
    scope_name = type.blank? ? nil : "#{type}s"

    associations_to_include = [
      :inventory_prompts, 
      :inventory_requests, 
      :employees_inventories, 
      :employee_mentors, 
      :employee_locations, 
      :roles,
      { invoices: [
          :before_images_attachments, 
          :after_images_attachments, 
          :client, 
          :invoice_group
        ]
      },
      { employees_inventories: [:product] },
      { employee_locations: [:location] }
    ]
  
    if scope_name.blank?
      # Eager load all the required associations when fetching employees
      employees = Employee.includes(associations_to_include)
    elsif Employee.respond_to?(scope_name)
      # Eager load the required associations for the specific scope
      employees = Employee.send(scope_name)
                        .includes(associations_to_include)
                        .exclude_mentors_for_employee(params[:mentor_for_employee_id])
    else
      render json: { error: 'Type is not valid' }, status: :bad_request and return
    end
  
    render json: employees, status: :ok
  end

  def show
    if current_employee.present?
      employee_id = current_employee.id

      employee = Employee.includes(
        invoices: [
          :before_images_attachments, 
          :after_images_attachments, 
          :client, 
          :invoice_group
        ], 
        employees_inventories: [:product], 
        employee_locations: [:location]
      ).find(employee_id)

      render json: employee, status: :ok
    end
  end
  

  def create
    @employee = Employee.new(employee_params)
    if @employee.save
      @employee.send_reset_password_mail
      render json: @employee, status: :created
    else
      render json: { 'error': @employee.errors }, status: :bad_request
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

  private

  def employee_params
    params.permit(:name, :vendor_name, :email, :password, :gfe, :service_percentage, :retail_percentage, :is_admin, :is_inv_manager, :is_mentor, :pay_50, employee_mentors_attributes: [:id, :employee_id, :mentor_id, :mentor_percentage, :_destroy], employee_locations_attributes: [:id, :employee_id, :location_id, :_destroy])
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

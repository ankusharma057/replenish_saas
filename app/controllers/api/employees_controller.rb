# frozen_string_literal: true

class Api::EmployeesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :find_employee, only: %i(update destroy )
  before_action :find_employee_to_be_updated, only: %i(update_inventories send_reset_password_link)

  def index
    employees = Employee.all 
    render json: employees, status: :ok
  end

  def show
    employee = current_employee
    render json: employee, status: :ok
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

  def destroy
    if @employee.destroy!
      render json: {'message' => 'Employee deleted successfully!'}, status: :ok
    else
      render json: { 'error': 'Record Not found' }, status: :bad_request
    end
  end

  def send_reset_password_link
    if @employee
      @employee.send_reset_password_mail
    else
      render json: { 'error': 'Record Not found' }, status: :bad_request
    end
  end

  def reset_password
    @employee = Employee.find_by(email: params[:email])
    if compare_passwords
      @employee.update!(password: params[:password])
      render json: @employee, status: :ok
    else 
      render json: {'error' => 'Passwords do not match, please try again.'}, status: 302
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
    params.permit(:name, :vendor_name, :email, :password, :gfe, :service_percentage, :retail_percentage, :is_admin, :is_inv_manager)
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

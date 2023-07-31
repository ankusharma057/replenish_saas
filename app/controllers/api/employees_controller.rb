# frozen_string_literal: true

class Api::EmployeesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :find_employee, only: %i(update update_inventories destroy send_reset_password_link reset_password)

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
    if @employee.save!
      @employee.send_reset_password_mail
      render json: @employee, status: :created
    else
      render json: { 'error': 'Employee could not be created.' }, status: :bad_request
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
      emp_inventory = @employee.employees_inventories.where(product_id: product_id).first
      emp_inventory_previous_quantity = emp_inventory.quantity.to_f
      emp_inventory.update(quantity: quantity_hash["quantity"].to_f)

      main_inventory = Inventory.find_or_create_by(product: Product.find_by(id: product_id))

      if emp_inventory_previous_quantity > quantity_hash["quantity"].to_f
        main_inventory.quantity += (emp_inventory_previous_quantity.to_f - quantity_hash["quantity"].to_f)
      else
        main_inventory.quantity -= (quantity_hash["quantity"].to_f - emp_inventory_previous_quantity.to_f)
      end
      
      main_inventory.save
    end

    params["new_products"].each do |product|
      company_inventory = Inventory.where(product: Product.where(name: product["product_name"])).first

      @employee.employees_inventories
        .create!(product: Product.where(name: product["product_name"]).first, quantity: product["quantity"])
    end
  end

  private

  def employee_params
    params.permit(:name, :email, :password, :gfe, :service_percentage, :retail_percentage, :is_admin, :is_inv_manager)
  end

  def find_employee
    @employee = Employee.find_by(id: params[:id] || session[:employee_id])    
  end

  def compare_passwords
    params[:password] == params[:confirmPassword] 
  end
end

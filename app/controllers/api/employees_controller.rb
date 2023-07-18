# frozen_string_literal: true

class Api::EmployeesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :find_employee, only: %i(update destroy send_reset_password_link reset_password)

  def index
    employees = Employee.all 
    render json: employees, status: :ok
  end

  def show
    employee = current_employee
    render json: employee, status: :ok
  end

  def name
    render json:{ greeting: "Hello #{params[:name]}" }, status: :ok
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
    binding.irb
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

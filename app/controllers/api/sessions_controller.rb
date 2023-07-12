# frozen_string_literal: true

class Api::SessionsController < ApplicationController
  skip_before_action :authorized_employee, only: :create
  before_action :find_employee

  def create
    if @employee && @employee.authenticate(params[:password])
      session[:employee_id] = @employee.id
      render json: @employee, status: :ok
    elsif trying_with_temp_password?
      session[:employee_id] = @employee.id
      render json: @employee, status: 302
    else
      render json: { error: "Invalid email or password" }, status: 401
    end
  end

  def destroy
    session.delete :employee_id
    head :no_content
  end

  private

  def find_employee
    @employee = Employee.find_by("lower(email) = ?", params[:email]&.downcase)
  end

  def trying_with_temp_password?
    @employee.temp_password == params[:password]
  end
end

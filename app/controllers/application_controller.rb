# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::Cookies
  before_action :authorized_employee

  private
  def current_employee
    @employee = Employee.find_by(id: session[:employee_id])
  end

  def authorized_employee
    render json: { errors: "Not Authorized" }, status: :unauthorized unless current_employee
  end
end

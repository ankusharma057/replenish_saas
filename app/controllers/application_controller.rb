# frozen_string_literal: true

class ApplicationController < ActionController::API
  include ActionController::Cookies
  before_action :authorized_employee

  private
  def current_employee
    if session[:employee_id].blank? && (Rails.env.development? || Rails.env.production?)
      employee_id = params[:current_employee_id]
    else
      employee_id = session[:employee_id]
    end
    @employee = Employee.find_by(id: employee_id)
  end

  def authorized_employee
    render json: { errors: "Not Authorized" }, status: :unauthorized unless current_employee
  end

  def send_message(text)
    # commenting for now to diable the send-message-functionality
    return true
    MessagingService::Client.new.send_message(text)
  end
end

class Api::AppointmentsController < ApplicationController

  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.includes(:client, :employee, :products, :treatments, :location, :payments).where("DATE(date) BETWEEN  ?  AND ?" , date_parse(params[:start_date]), (date_parse(params[:end_date]) || Date.today)) if params[:start_date] && schedules.present?

    render json: schedules, each_serializer: AppointmentSerializer, status: :ok
  end

  def date_parse(date)
    Date.strptime(date, '%m/%d/%Y')
  end

  def client_appointments
    schedules = Schedule.where(client_id: params[:client_id])
    # Filters
    schedules = schedules.where(state: params[:state]) if params[:state].present?
    schedules = schedules.where(location_id: params[:location_id]) if params[:location_id].present?
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where(billing_status: params[:billing_status]) if params[:billing_status].present?
    if params[:start_date].present? && params[:end_date].present?
      schedules = schedules.where("DATE(created_at) BETWEEN ? AND ?", date_parse(params[:start_date]), date_parse(params[:end_date]))
    elsif params[:start_date].present? 
      schedules = schedules.where("DATE(created_at) >= ?", date_parse(params[:start_date]))
    elsif params[:end_date].present?
      schedules = schedules.where("DATE(created_at) <= ?", date_parse(params[:end_date]))
    end
    schedules = schedules.includes(:client, :employee, :products, :treatments, :location, :payments)
    render json: schedules
  end
end
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
end
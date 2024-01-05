class Api::SchedulesController < ApplicationController
  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where("DATE(date) BETWEEN  ?  AND ?" , params[:start_date], (params[:end_date] || Date.today)) if params[:start_date]

    render json: schedules, status: :ok
  end

  def create
    schedule = Schedule.new(schedule_param)
    schedule.client = set_client
    if schedule.save
      render json: schedule, status: :created
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  private
  def schedule_param
    params.require(:schedule).permit(:product_type, :treatment, :start_time, :end_time, :date, :employee_id, :product_id)
  end

  def set_client
    client = Client.find_by(id: params[:schedule][:client_id])
    unless client.present?
      client = Client.new(name: params[:schedule][:client_id])
      client.employee_id = params[:schedule][:employee_id]
      client.save
    end

    client
  end
end

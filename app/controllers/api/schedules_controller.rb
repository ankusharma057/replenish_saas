class Api::SchedulesController < ApplicationController
  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where(date: params[:date]) if params[:date].present?

    render json: schedules, status: :ok
  end

  def create
    schedule = schedule_param
    schedule.client = set_client
  end

  private
  def schedule_param
    params.require(:schedule).permit(:product_type, :treatment, :start_time, :end_time, :date)
  end

  def set_client
    client = Client.find_or_initialize_by(name: params[:schedule][:client_name])
    if client.new_record?
      client.emaploye_id = params[:schedule][:employee_id]
      client.save
    end

    client
  end
end

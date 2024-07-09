class Api::SchedulesController < ApplicationController
  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where("DATE(date) BETWEEN  ?  AND ?" , date_parse(params[:start_date]), (date_parse(params[:end_date]) || Date.today)) if params[:start_date] && schedules.present?

    render json: schedules, status: :ok
  end

  def create
    schedule = Schedule.new(schedule_param)
    schedule.client = set_client
    if schedule.save
      render json: schedule, status: :created
    else
      render json: {error: schedule.errors }, status: :unprocessable_entity
    end
  end

  def remaining_paid
    schedule = Schedule.find_by(id: params[:id])
    render json: {error: "No inventories"}, status: :unprocessable_entity and return unless schedule.check_for_inventory
    if schedule.present?
      amount = schedule.remaining_amt.to_i
      render json: {error: "No Amount remaining for this schedule" }, status: :unprocessable_entity and return if amount.zero?
      
      schedule.client.payments.create(
        status: "paid",
        schedule_id: schedule.id,
        amount: amount
      )
      render json: "Payment Done!", status: :created
    else
      render json: {error: "Something went wrong.." }, status: :unprocessable_entity
    end
  end

  def destroy
    schedule = Schedule.find_by(id: params[:id])
    if schedule && schedule.cancel_schedule(current_employee)
      render json: { message: "Schedule deleted." }, status: :ok
    else
      render json: { error: "Something went wrong or schedule not found." }, status: :unprocessable_entity
    end
  end
  
  private
  def schedule_param
    params.require(:schedule).permit(:product_type, :treatment_id, :start_time, :end_time, :date, :employee_id, :product_id)
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

  def date_parse(date)
    DateTime.strptime(date, "%m/%d/%Y")
  end
end

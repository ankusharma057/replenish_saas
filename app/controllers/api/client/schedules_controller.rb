class Api::Client::SchedulesController < ClientApplicationController
  skip_before_action :authorized_client, only: [:index, :employee_unavailability]

  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where(client_id: params[:client_id]) if params[:client_id].present?
    schedules = schedules.where("DATE(date) BETWEEN  ?  AND ?", params[:start_date], (params[:end_date] || Date.today)) if params[:start_date]

    render json: schedules, status: :ok
  end

  def appointments
    schedules = current_client.schedules
    render json: schedules, status: :ok
  end

  def balance_due_schedules
    schedules = current_client.schedules.balance_amount
    render json: schedules, status: :ok
  end

  def employee_unavailability
    employee = Employee.find_by(id: params[:employee_id])
    unavails = employee.unavailabilities

    render json: unavails
  end

  def create
    schedule = current_client.schedules.new(schedule_param)
    if schedule.save
      response_data = Stripe::Payment.create(schedule)
      record_payment_from_session(response_data, schedule, 50)
      send_payment_notifications(schedule, 50)

      render json: {schedule: ScheduleSerializer.new(schedule)}.merge!({redirect_url: response_data['url']}), status: :created
    else
      render json: {error: schedule.errors}, status: :unprocessable_entity
    end
  end

  def reminder
    @schedule = current_client.schedules.find_by(id: params[:id])
    if @schedule
      @schedule.update(reminder: params[:reminder])
      @schedule.update_reminder
      render json: {message: "Reminder Updated with #{@schedule.reminder}!!"}, status: :ok
    else
      render json: {error: "Schedule not found"}, status: :unprocessable_entity
    end
  end

  def remaining_pay
    schedule = Schedule.find_by(id: params[:id])
    render json: {error: "No inventories"}, status: :unprocessable_entity and return unless schedule.check_for_inventory
    if schedule.present?
      amount = schedule.remaining_amt.to_i
      response_data = Stripe::Payment.create(schedule, amount)
      record_payment_from_session(response_data, schedule, amount)
      send_payment_notifications(schedule, amount)

      render json: {schedule: schedule}.merge!({redirect_url: response_data['url']})
    else
      render json: {error: "Something went wrong or schedule not found."}, status: :unprocessable_entity
    end
  end

  def destroy
    schedule = Schedule.find_by(id: params[:id])
    if schedule && schedule.cancel_client_schedule(current_client)
      render json: {message: "Schedule deleted."}, status: :ok
    else
      render json: {error: "Something went wrong or schedule not found."}, status: :unprocessable_entity
    end
  end

  private

  def schedule_param
    params.require(:schedule).permit(:product_type, :start_time, :end_time, :date, :employee_id, :product_id, :treatment_id, :location_id)
  end

  def record_payment_from_session(session, schedule, amount)
    current_client.payments.create(
      status: "Pending",
      schedule_id: schedule.id,
      amount: amount,
      session_id: session.id
    )
  end

  def send_payment_notifications(schedule, amount)
    client = schedule.client
    employee = schedule.employee
    ScheduleMailer.client_notification(schedule, client, amount).deliver_now
    ScheduleMailer.employee_notification(schedule, employee, client, amount).deliver_now
  end
end

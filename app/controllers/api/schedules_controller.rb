class Api::SchedulesController < ApplicationController
  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where("DATE(date) BETWEEN  ?  AND ?" , date_parse(params[:start_date]), (date_parse(params[:end_date]) || Date.today)) if params[:start_date] && schedules.present?

    render json: schedules, status: :ok
  end

  def get_client_schedule
    schedules = Schedule.all
    schedules = schedules.where(client_id: params[:client_id]) if params[:client_id].present?
    schedules = schedules.where("DATE(date) BETWEEN  ?  AND ?" , date_parse(params[:start_date]), (date_parse(params[:end_date]) || Date.today)) if params[:start_date] && schedules.present?

    render json: schedules, status: :ok
  end

  def create
    schedule = Schedule.new(schedule_param)
    schedule.client = set_client
    amount = 0
    if schedule.save
      schedule.send_payment_notifications(amount)
      render json: schedule, status: :created
    else
      render json: {error: schedule.errors }, status: :unprocessable_entity
    end
  end

  def show
    schedule = Schedule.find(params[:id])
    if schedule
      render json: schedule, status: :ok
    else
      render json: { error: "Schedule not found" }, status: :not_found
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

      schedule.send_payment_notifications(amount)
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

  def get_client_schedule_only
    if params[:client_id].present?
      schedules = Schedule.client_schedules(params[:client_id])
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
      render json: schedules, status: :ok
    else
      render json: [], status: :ok
    end
  end

  def update
    schedule = Schedule.find(params[:id])
    if schedule
      if schedule.update(schedule_param)
        render json: schedule, status: :ok
      else
        render json: {error: "Schedule not updated"}, status: :unprocessable_entity
      end
    else
      render json: { error: "Schedule not found" }, status: :not_found
    end
  end

  def add_note
    schedule = Schedule.find(params[:schedule_id])
    schedule.notes ||= []
    next_id = schedule.notes.size + 1

    note = {
      id: next_id,
      content: params[:content],
      due_date: params[:due_date],
      employee_id: params[:employee_id],
      favorite: params[:favorite] || false,
      updated_at: nil
    }
    
    schedule.notes << note
    if schedule.save
      render json: { message: "Note added successfully", note: note }, status: :created
    else
      render json: { error: "Failed to add note" }, status: :unprocessable_entity
    end
  end

  def update_note
    schedule = Schedule.find(params[:schedule_id])
    note = schedule.notes.find { |n| n["id"].to_s == params[:note_id] }

    if note
      note["content"] = params[:content] if params[:content].present?
      note["due_date"] = params[:due_date] if params[:due_date].present?
      note["employee_id"] = params[:employee_id] if params[:employee_id].present?
      note["favorite"] = params[:favorite] unless params[:favorite].nil?
      note["updated_at"] = params[:updated_at] if params[:updated_at].present?

      if schedule.save
        render json: { message: "Note updated successfully", note: note }, status: :ok
      else
        render json: { error: "Failed to update note" }, status: :unprocessable_entity
      end
    else
      render json: { error: "Note not found" }, status: :not_found
    end
  end

  def delete_note
    schedule = Schedule.find(params[:schedule_id])
    if schedule.notes.reject! { |n| n["id"].to_s == params[:note_id] }
      schedule.save
      render json: { message: "Note deleted successfully" }, status: :ok
    else
      render json: { error: "Note not found" }, status: :not_found
    end
  end

  def show
    schedule = Schedule.find(params[:id])
    if schedule
      render json: schedule, status: :ok
    else
      render json: { error: "Schedule not found" }, status: :not_found
    end
  end

  private

  def schedule_param
    params.require(:schedule).permit(:product_type, :treatment_id, :start_time, :end_time, :date, :employee_id, :product_id, :location_id, treatment_ids: [],  product_ids: [],  notes: [:id, :content, :due_date, :employee_id, :updated_at])
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
    Date.strptime(date, '%m/%d/%Y')
  end
end

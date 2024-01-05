class Api::Client::SchedulesController < ClientApplicationController
  skip_before_action :authorized_client, only: [:index]
  
  def index
    schedules = Schedule.all
    schedules = schedules.where(employee_id: params[:employee_id]) if params[:employee_id].present?
    schedules = schedules.where(client_id: params[:client_id]) if params[:client_id].present?
    schedules = schedules.where("DATE(date) BETWEEN  ?  AND ?" , params[:start_date], (params[:end_date] || Date.today)) if params[:start_date]

    render json: schedules, status: :ok
  end

  def create
    schedule = current_client.schedules.new(schedule_param)
    if schedule.save
      render json: schedule, status: :created
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  private
  def schedule_param
    params.require(:schedule).permit(:product_type, :treatment, :start_time, :end_time, :date, :employee_id, :product_id, :treatment_id)
  end
end

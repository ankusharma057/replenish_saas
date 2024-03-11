class Api::UnavailabilitiesController < ApplicationController
  
  def index
    unavails = Unavailability.where(employee_id: params[:employee_id] || current_employee.id)
    
    render json: unavails
  end

  def create
    unavail = Unavailability.new(unavailable_params)

    if unavail.save
      render json: unavail
    else
      render json: {error: 'Something went wrong with the Unavailability!'}, status: :unprocessable_entity
    end
  end

  def update
    unavail = current_employee.unavailabilities.find_by(id: params[:id])
    if unavail.update(unavailable_params)
      render json: unavail
    else
      render json: {error: 'Something went wrong with the Unavailability!'}, status: :unprocessable_entity
    end
  end

  def destroy
    unavail = current_employee.unavailabilities.find_by(id: params[:id])
    if unavail&.destroy
      render json: unavail
    else
      render json: {error: 'Unavailability does not exist'}, status: :unprocessable_entity
    end
  end

  private
  def unavailable_params
    params.permit(:start_time, :end_time, :available, :every_week, :employee_id)
  end
end

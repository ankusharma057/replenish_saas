class Api::AvailabilitiesController < ApplicationController
  include AvailabilityConcern
  skip_before_action :authorized_employee

  def index
    if params[:employee_id].present?
      render json: Availabilities.employee_locations_availabilities(params)
    else
      render json: { error: 'employee_id is required' }, status: :unprocessable_entity
    end
  end

  def create
    create_or_update_availability
  end

  def destroy
    availability_timing = AvailabilityTiming.find_by(id: params[:id])
    @availability = availability_timing&.availabilities
    if @availability&.destroy
      render json: @availability
    else
      render json: { error: 'Availability does not exist' }, status: :unprocessable_entity
    end
  end
end

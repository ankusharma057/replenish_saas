class Api::LocationsController < ApplicationController
  def index
    locations = Location.exclude_locations_for_employee(params)
    
    render json: locations, status: :ok
  end

  def create
    location = Location.find_or_create_by(name: params[:location])
    if location
      location.update(location_params)
      location.employees = Employee.where(id: params[:employee_ids]) if params[:employee_ids]
      render json: location, status: :created
    else
      render json: { error: 'Unable create or find location' }, status: :unprocessable_entity
    end
  end

  def show
    location = Location.find_by(id: params[:id])
    render json: location, status: :ok
  end

  def update
    location = Location.find_by(id: params[:id])
    if location
      if location.update(location_params)
        render json: location, status: :ok
      else
        render json: { error: 'Unable to update location', details: location.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Location not found' }, status: :not_found
    end
  end

  def reorder_location
    employee = Employee.find_by(id: params[:employee_id])
    location_ids = params[:location_ids]

    if employee && location_ids.present?
      EmployeeLocation.transaction do
        location_ids.each_with_index do |location_id, index|
          employee_location = EmployeeLocation.find_by(employee_id: employee.id, location_id: location_id)
          employee_location.update!(position: index + 1) if employee_location
        end
      end
      render json: { success: 'Locations reordered successfully for the employee' }, status: :ok
    else
      render json: { error: 'Invalid employee or location data' }, status: :unprocessable_entity
    end
  rescue => e
    render json: { error: 'Failed to reorder locations', details: e.message }, status: :unprocessable_entity
  end


  def get_locations
    employee = Employee.find_by(id: params[:employee_id])
    if employee
      locations = EmployeeLocation
                    .where(employee_id: employee.id)
                    .includes(:location)
                    .order(:position)
      render json: locations.map { |el| format_location(el) }, status: :ok
    else
      render json: { error: 'Employee not found' }, status: :not_found
    end
  end

  private

  def format_location(employee_location)
    location = employee_location.location
    location.as_json.merge(position: employee_location.position)
  end


  def location_params
    params.permit(:name, :short_description, :long_description, :email, :phone_number, :fax, :street_address, :apartment, :city, :country, :province, :postal_code, :display_location_address, :display_map_in_emails, :legal_name, :business_number, :use_location_for_billing, :online_booking_available
    )
  end
end

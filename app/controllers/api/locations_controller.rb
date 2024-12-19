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
      render json: { error: 'Something went wrong!' }, status: :unprocessable_entity
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

  private
  def location_params
    params.permit(:name, :short_description, :long_description, :email, :phone_number, :fax, :street_address, :apartment, :city, :country, :province, :postal_code, :display_location_address, :display_map_in_emails, :legal_name, :business_number, :use_location_for_billing, :online_booking_available
    )
  end
end

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


  def employees
    location = Location.find_by(id: params[:id])
    employees = location.employees

    render json: employees, status: :ok
  end

  private
  def location_params
    params.permit(:short_description, :long_description, :email, :phone_number, :fax, :street_address, :apartment, :city, :country, :province, :postal_code, :display_location_address, :display_map_in_emails, :legal_name, :business_number, :use_location_for_billing, :online_booking_available
    )
  end
end

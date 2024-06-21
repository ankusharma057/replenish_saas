class Api::LocationsController < ApplicationController
  def index
    locations = Location.exclude_locations_for_employee(params[:skip_by_employee_id])
    
    render json: locations, status: :ok
  end

  def create
    location = Location.find_or_create_by(name: params[:location])

    if location
      location.employees = Employee.where(id: params[:employee_ids])

      render json: location, status: :created
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  def employees
    location = Location.find_by(id: params[:id])
    employees = location.employees

    render json: employees, status: :ok
  end
end

class Api::LocationsController < ApplicationController
  def index
    locations = Location.all
    
    render json: locations, status: :ok
  end

  def employees
    location = Location.find_by(id: params[:id])
    employees = location.employees

    render json: employees, status: :ok
  end
end

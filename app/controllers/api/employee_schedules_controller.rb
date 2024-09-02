class Api::EmployeeSchedulesController < ApplicationController
  def index
    @employees = Employee.all
    render json: @employees, each_serializer: EmployeeScheduleSerializer, status: :ok
  end

  def employees
    location = Location.find_by(id: params[:id])

    if location.present?
      employees = location.employees
    else
      employees = []
    end

    render json: employees, each_serializer: EmployeeScheduleSerializer, status: :ok
  end
end

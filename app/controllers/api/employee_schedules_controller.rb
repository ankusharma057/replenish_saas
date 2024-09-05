class Api::EmployeeSchedulesController < ApplicationController
  def index
    @employees = Employee.includes(employee_locations: :location).all
    render json: @employees, each_serializer: EmployeeScheduleSerializer, status: :ok
  end

def employees
  location = Location.includes(employees: { employee_locations: :location }).find_by(id: params[:id])
  employees = location.present? ? location.employees : []
  render json: employees, each_serializer: EmployeeScheduleSerializer, status: :ok
end
end

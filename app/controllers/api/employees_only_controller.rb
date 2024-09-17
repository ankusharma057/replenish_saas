class Api::EmployeesOnlyController < ApplicationController

  def index
    @employees = Employee.includes(
      :roles, 
      employee_locations: :location, 
      employee_mentors: :mentor, 
      employees_inventories: :product, 
    )
    render json: @employees, each_serializer: EmployeesOnlySerializer, status: :ok
  end
end

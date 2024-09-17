class Api::EmployeesOnlyController < ApplicationController

  def index
    @employees = Employee.includes(
      :roles, 
      :invoices, 
      employee_locations: :location, 
      employee_mentors: :mentor, 
      employees_inventories: :product, 
      invoices: :client
    )
    render json: @employees, each_serializer: EmployeesOnlySerializer, status: :ok
  end
end

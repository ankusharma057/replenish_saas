class Api::Client::EmployeesController < ClientApplicationController
  def index
    employees = Employee.all
    render json: employees, status: :ok
  end

  def show
    employee = Employee.find_by(id: params[:id])
    render json: employee, status: :ok
  end
end

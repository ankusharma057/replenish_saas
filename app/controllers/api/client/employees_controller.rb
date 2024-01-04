class Api::Client::EmployeesController < ClientApplicationController
  skip_before_action :authorized_client, only: [:show]
  
  def index
    employees = Employee.all
    render json: employees, status: :ok
  end

  def show
    employee = Employee.find_by(id: params[:id])
    render json: employee, status: :ok
  end
end

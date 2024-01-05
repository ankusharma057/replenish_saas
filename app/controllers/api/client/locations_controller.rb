class Api::Client::LocationsController < ClientApplicationController
  skip_before_action :authorized_client

  def index
    locations = Location.all

    render json: locations, employees: true
  end

  # def create
  #   location = Location.find_or_create_by(name: params[:location])

  #   if location
  #     location.employees = Employee.where(id: params[:employee_ids])

  #     render json: location, status: :created
  #   else
  #     render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
  #   end
  # end

  def employees
    location = Location.find_by(id: params[:id])
    employees = location.employees

    render json: employees, status: :ok
  end
end

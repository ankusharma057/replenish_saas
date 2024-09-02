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

    if location.present?
      employees = location.employees.includes(
        :inventory_prompts,
        :inventory_requests,
        :employees_inventories,
        :employee_mentors,
        :employee_locations,
        :roles,
        invoices: [
          :before_images_attachments, 
          :after_images_attachments, 
          :client, 
          :invoice_group
        ],
        employees_inventories: [:product],
        employee_locations: [:location]
      )
    else
      employees = []
    end
  
    render json: employees, status: :ok
  end
end

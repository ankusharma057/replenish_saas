class Api::Client::RegistrationsController < ClientApplicationController
  skip_before_action :authorized_client, only: [:sign_up]

  def sign_up
    employee = Employee.find_by(reference_number: params[:ref])
    
    client = if employee.present?
      employee.clients.new(client_params)
    else
      Client.new(client_params)
    end
    client.timezone = params[:timezone] if params[:timezone]
    if client.save!
      session[:client_id] = client.id
      render json: client, status: :ok
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  private
  def client_params
    params.require(:client).permit(:email, :name, :employee_id, :password, :timezone)
  end
end

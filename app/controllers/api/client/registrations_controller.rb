class Api::Client::RegistrationsController < ClientApplicationController
  skip_before_action :authorized_client, only: [:sign_up]

  def sign_up
    employee = Employee.find_by(reference_number: params[:ref])
    client = employee.clients.new(client_params)

    if client.save!
      session[:client_id] = client.id
      render json: client, status: :ok
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  private
  def client_params
    params.require(:client).permit(:email, :name, :employee_id, :password)
  end
end

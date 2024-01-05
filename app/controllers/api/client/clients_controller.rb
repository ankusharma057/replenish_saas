class Api::Client::ClientsController < ClientApplicationController
  before_action :find_client, only: [:sign_in, :password_update]
  skip_before_action :authorized_client, only: [:create, :sign_in]

  def profile
    client = Client.find_by(id: session[:client_id])
    if client
      render json: client, status: :ok
    else
      render json: { errors: "Not Authorized" }, status: :unauthorized
    end
  end
end

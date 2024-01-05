class ClientApplicationController < ActionController::API
	include ActionController::Cookies
	before_action :authorized_client

  private
  def current_client
    @client = Client.find_by(id: session[:client_id])
  end

  def authorized_client
    render json: { errors: "Not Authorized" }, status: :unauthorized unless current_client
  end
end

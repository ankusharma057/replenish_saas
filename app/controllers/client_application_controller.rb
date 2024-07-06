class ClientApplicationController < ActionController::API
	include ActionController::Cookies
	before_action :authorized_client

  private
  def current_client
    if session[:client_id].blank? && Rails.env.development?
      client_id = params[:current_client_id]
    else
      client_id = session[:client_id]
    end
    @client = Client.find_by(id: client_id)
  end

  def authorized_client
    render json: { errors: "Not Authorized" }, status: :unauthorized unless current_client
  end
end

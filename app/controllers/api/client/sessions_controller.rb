# frozen_string_literal: true

class Api::Client::SessionsController < ClientApplicationController
  skip_before_action :authorized_client, only: :create
  before_action :find_client, only: [:create]

  def create
    if @client && @client.authenticate(params[:password])
      session[:client_id] = @client.id
      render json: @client, status: :ok
    elsif trying_with_temp_password?
      session[:client_id] = @client.id
      render json: @client, status: 302
    else
      render json: { error: "Invalid email or password" }, status: 401
    end
  end

  def destroy
    session.delete :client_id
    head :no_content
  end

  def password_update
    if current_client.update!(password: params[:password])
      render json: @client, status: :ok
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  private
  
  def find_client
    @client = Client.find_by("lower(email) = ?", params[:email]&.downcase)
  end

  def trying_with_temp_password?
    @client&.temp_password == params[:password]
  end
end

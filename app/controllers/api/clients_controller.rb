# frozen_string_literal: true

class Api::ClientsController < ApplicationController
  before_action :find_client, only: [:sign_in, :password_update]

  def index
    clients = Client.all
    clients = clients.where(employee_id: params[:employee_id]) if params[:employee_id]

    render json: clients, status: :ok
  end

  def profile
    client = Client.find_by(id: session[:client_id])
    if client
      render json: client, status: :ok
    else
      render json: { errors: "Not Authorized" }, status: :unauthorized
    end
  end

  def create
    employee = Employee.find_by(reference_number: params[:ref])
    client = employee.clients.new(client_params)

    if client.save!
      session[:client_id] = client.id
      render json: client, status: :ok
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  def sign_in
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

  def sign_out
    session.delete :client_id
    head :no_content
  end

  def password_update
    if @client.update!(password: params[:password])
      render json: @client, status: :ok
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  def signup
    @employee = Employee.find_by(id: params[:employee_id])
    if @employee
      @employee.clients.create(sign_up_params)
    else
    end
  end

  private
  def client_params
    params.require(:client).permit(:email, :name, :employee_id, :password)
  end

  def random_str
    5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("").gsub(/\s+/, "")
  end
  
  def find_client
    @client = Client.find_by("lower(email) = ?", params[:email]&.downcase)
  end

  def trying_with_temp_password?
    @client&.temp_password == params[:password]
  end
end




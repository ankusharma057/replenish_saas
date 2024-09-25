# frozen_string_literal: true

class Api::ClientsController < ApplicationController
  before_action :find_client, only: [:sign_in, :password_update]
  skip_before_action :authorized_employee

  def index
    clients = current_employee&.is_admin? ? Client.all : current_employee&.clients
    clients = clients.includes(:employees) if clients.present?
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
    client = Client.new(client_params)

    if client.save
      if (!current_employee.is_admin?)
        client.employee_ids = [current_employee.id]
      end

      session[:client_id] = client.id if params[:skip_login] != "true"
      render json: client, status: :ok
    else
      render json: { error: client.errors.as_json }, status: :ok
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
    if @client.update!(password: params[:password], temp_password: nil)
      render json: @client, status: :ok
    else
      render json: {error: 'Failed to update password!'}, status: :unprocessable_entity
    end
  end

  def signup
    @employee = Employee.find_by(id: params[:employee_id])
    if @employee
      @employee.clients.create(sign_up_params)
      render json: { message: 'Signed up successfully' }, status: :created
    else
      render json: { error: 'Employee not found' }, status: :not_found
    end
  end

  def update
    @client = Client.find_by(id: params[:id])
    if @client
      if client_params[:email].present?
        new_email = client_params[:email].downcase
        if @client.email == new_email
          render json: { error: "New email can't be the same as the existing email" }, status: :unprocessable_entity and return
        elsif Client.where.not(id: @client.id).exists?(email: new_email)
          render json: { error: "Email is already taken" }, status: :unprocessable_entity and return
        end
      end

      if @client.update(client_params)
        render json: @client, status: :ok
      else
        render json: { errors: @client.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Client not found" }, status: :not_found
    end
  end


  private

  def client_params
    params.require(:client).permit(:email, :name, :employee_id, :password, :temp_password, :address, :phone_number)
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




# frozen_string_literal: true

class Api::ClientsController < ApplicationController
  def index
    clients = Client.all
    clients = clients.where(employee_id: params[:employee_id]) if params[:employee_id]

    render json: clients, status: :ok
  end

  def create
    client = Client.new(client_params)
    client.temp_password =  random_str
    debugger
    if client.save!
      render json: client, status: :ok
    else
      render json: {error: 'Something went wrong!'}, status: :unprocessable_entity
    end
  end

  private
  def client_params
    params.require(:client).permit(:email, :name, :employee_id)
  end

  def random_str
    5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("").gsub(/\s+/, "")
  end
end

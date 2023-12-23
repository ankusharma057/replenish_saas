# frozen_string_literal: true

class Api::ClientsController < ApplicationController
  def index
    clients = Client.all
    clients = clients.where(employee_id: params[:employee_id]) if params[:employee_id]
    
    render json: clients, status: :ok
  end
end

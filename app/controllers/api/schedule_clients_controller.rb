class Api::ScheduleClientsController < ApplicationController

  def index
    clients = current_employee&.is_admin? ? Client.all : current_employee&.clients

    render json: clients, each_serializer: ScheduleClientSerializer, status: :ok
  end
end
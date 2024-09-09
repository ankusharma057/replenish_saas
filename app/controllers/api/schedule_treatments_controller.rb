class Api::ScheduleTreatmentsController < ApplicationController

  def index
    treatments = Treatment.employee_treatments(params[:employee_id])

    render json: treatments, each_serializer: ScheduleTreatmentSerializer, status: :ok
  end
end
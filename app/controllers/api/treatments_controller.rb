class Api::TreatmentsController < ApplicationController
  skip_before_action :authorized_employee

  def index    
    render json: Treatment.employee_treatments(params[:employee_id])
  end

  def base_treatments
    render json: Treatment.filtered_treatments(params[:employee_id])
  end

  def create
    treatment = Treatment.new(treatment_params)
    if treatment.save
      render json: treatment
    else
      render json: {error: 'Something went wrong with the Treatment!'}, status: :unprocessable_entity
    end
  end

  def update
    treatment = Treatment.find_by(id: params[:id])
    if treatment.update(treatment_params)
      render json: treatment
    else
      render json: {error: 'Something went wrong with the Treatment!'}, status: :unprocessable_entity
    end
  end

  def destroy
    treatment = Treatment.find_by(id: params[:id])
    if treatment&.destroy
      render json: treatment
    else
      render json: {error: 'Treatment does not exist'}, status: :unprocessable_entity
    end
  end

  private
  def treatment_params
    params.permit(:duration, :product_id, :name, :description, :cost, :products_used, :created_by)
  end
end

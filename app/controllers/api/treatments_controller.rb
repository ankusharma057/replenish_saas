class Api::TreatmentsController < ApplicationController
  
  def index    
    render json: Treatment.all
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
    params.permit(:duration, :product_id, :name)
  end
end

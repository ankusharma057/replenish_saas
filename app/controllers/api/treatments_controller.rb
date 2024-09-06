class Api::TreatmentsController < ApplicationController
  before_action :treatment_created_by, only: %i[create update destroy]
  skip_before_action :authorized_employee, only: %i[index]

  def index
    treatments = Treatment
                   .employee_treatments(params[:employee_id])
                   .includes(:employee, :product, treatment_intake_forms: :intake_form)
    render json: treatments, status: :ok
  end

  def base_treatments
    render json: Treatment.base_treatments
  end

  def create
    treatment = Treatment.new(treatment_params)
    if treatment.save
      render json: treatment
    else
      render json: { error: treatment.errors.as_json }, status: :ok
    end
  end

  def update
    treatment = Treatment.find_by(id: params[:id])
    if treatment.update(treatment_params)
      render json: treatment
    else
      render json: { error: treatment.errors.as_json }, status: :ok
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

  def show
    treatment = Treatment.includes(treatment_intake_forms: :intake_form).find_by(id: params[:id])
    if treatment.present?
      render json: treatment, status: :ok
    else
      render json: { error: 'Treatment does not exist' }, status: :unprocessable_entity
    end
  end

  private

  def treatment_params
    params.permit(:duration, :product_id, :name, :description, :cost, :quantity, :created_by, treatment_intake_forms_attributes: [:id, :treatment_id, :intake_form_id, :_destroy])
  end

  def treatment_created_by
    created_by = params[:created_by]
    if current_employee.is_admin?
      return
    else
      params[:created_by] = current_employee&.id
    end
  end

end

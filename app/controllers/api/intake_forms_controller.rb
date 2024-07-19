class Api::IntakeFormsController < ApplicationController
  skip_before_action :authorized_employee
  before_action :set_intake_form, only: %i[update destroy show]

  def index
    @intake_forms = IntakeForm.treatment_intake_forms(params)
    render json: @intake_forms
  end

  def create
    @intake_form = IntakeForm.new(intake_form_params)
    if @intake_form.save
      associate_employees_and_treatments
      render json: @intake_form, status: :created
    else
      render json: {error: @intake_form.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @intake_form.update(intake_form_params)
      update_associations
      render json: @intake_form
    else
      render json: {error: @intake_form.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    if @intake_form.destroy
      render json: @intake_form
    else
      render json: {error: @intake_form.errors }, status: :unprocessable_entity
    end
  end

  def show
    render json: @intake_form
  end

  private

  def set_intake_form
    @intake_form = IntakeForm.find_by(id: params[:id])
  end

  def intake_form_params
    params.require(:intake_form).permit(:id, :name, :prompt_type, :effective_date, :valid_for, :introduction, :appointment_type, :employee_id, treatment_ids: [], form_data: {})
  end

  def associate_employees_and_treatments
    if params[:intake_form][:treatment_ids]
      @intake_form.treatments = Treatment.find(params[:intake_form][:treatment_ids])
    end
  end

  def update_associations
    if params[:treatment_ids]
      @intake_form.treatments = Treatment.find(params[:treatment_ids])
    end
  end
end
class Api::QuestionnairesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :set_questionnaire, only: %i[update destroy show]

  def index
    @questionnaires = Questionnaire.includes(:employee).employee_questionnaires(params)
    render json: @questionnaires
  end

  def create
    @questionnaire = Questionnaire.new(questionnaire_params)
    if @questionnaire.save
      render json: @questionnaire, status: :created
    else
      render json: {error: @questionnaire.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @questionnaire.update(questionnaire_params)
      render json: @questionnaire
    else
      render json: {error: @questionnaire.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    if @questionnaire.destroy
      render json: @questionnaire
    else
      render json: {error: @questionnaire.errors }, status: :unprocessable_entity
    end
  end

  def show
    render json: @questionnaire
  end

  private

  def set_questionnaire
    @questionnaire = Questionnaire.find_by(id: params[:id])
  end

  def questionnaire_params
    params.require(:questionnaire).permit(:id, :name, :employee_id, template: {})
  end
end
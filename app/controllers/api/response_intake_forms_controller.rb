class Api::ResponseIntakeFormsController < ApplicationController
  skip_before_action :authorized_employee
  before_action :set_intake_form, only: %i[update destroy show]

  def index
    @response_intake_forms = ResponseIntakeForm.get_response_intake_form(params)
    render json: @response_intake_forms
  end

  def create
    @response_intake_form = ResponseIntakeForm.new(response_intake_form_params)
    if @response_intake_form.save
      render json: @response_intake_form, status: :created
    else
      render json: @response_intake_form.errors, status: :unprocessable_entity
    end
  end

  def update
    if @response_intake_form.update(response_intake_form_params)
      render json: @response_intake_form
    else
      render json: @response_intake_form.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @response_intake_form.destroy
      render json: @response_intake_form
    else
      render json: @response_intake_form.errors, status: :unprocessable_entity
    end
  end

  def show
    if @response_intake_form.present?
      render json: @response_intake_form
    else
      render json: {error: 'Response Intake Form does not exist'}, status: :unprocessable_entity
    end
  end

  private

  def set_intake_form
    @response_intake_form = ResponseIntakeForm.find_by(id: params[:id])
  end

  def response_intake_form_params
    params.require(:response_intake_form).permit(:intake_form_id, :client_id, response_form_data:{})
  end
end

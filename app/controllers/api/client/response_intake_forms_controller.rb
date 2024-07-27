class Api::Client::ResponseIntakeFormsController < ClientApplicationController

  def index
    @response_intake_forms = ResponseIntakeForm.client_response_intake_forms(current_client)
    render json: @response_intake_forms
  end

  def show
    @response_intake_form = ResponseIntakeForm.find_by(id: params[:id])
    if @response_intake_form.present?
      render json: @response_intake_form
    else
      render json: {error: 'Response Intake Form does not exist'}, status: :unprocessable_entity
    end
  end
end

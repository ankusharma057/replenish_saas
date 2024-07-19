class Api::Client::IntakeFormsController < ClientApplicationController

  def index
    intake_forms = IntakeForm.client_intake_forms(params, current_client)
    render json: intake_forms
  end

  def show
    @intake_form = IntakeForm.find_by(id: params[:id])
    intake_form = IntakeForm.client_intake_form(@intake_form, current_client)
    render json: intake_form
  end
end
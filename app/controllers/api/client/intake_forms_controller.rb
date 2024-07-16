class Api::Client::IntakeFormsController < ClientApplicationController

  def index
    intake_forms = IntakeForm.client_intake_forms(params, current_client)
    render json: intake_forms
  end
end
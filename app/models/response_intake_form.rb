class ResponseIntakeForm < ApplicationRecord
  belongs_to :intake_form
  belongs_to :client

  validates :response_form_data, presence: { message: "Response form data can't be blank"  }

  def self.client_response_intake_forms(current_client)
    filter_by_client(current_client&.id, employee_id = nil)
  end

  def self.get_response_intake_form(params)
    filter_by_client(params[:client_id], params[:employee_id])
  end

  private

  def self.filter_by_client(client_id, employee_id)
    query = includes(:intake_form, :client)

    if client_id.present? && employee_id.present?
      query.joins(:intake_form).where(client_id: client_id, intake_forms: { employee_id: employee_id })
    elsif client_id.present?
      query.where(client_id: client_id)
    else
      query.all
    end
  end
end

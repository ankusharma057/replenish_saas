class ResponseIntakeForm < ApplicationRecord
  belongs_to :intake_form
  belongs_to :client

  validates :response_form_data, presence: { message: "Response form data can't be blank"  }

  def self.client_response_intake_forms(current_client)
    filter_by_client(current_client&.id)
  end

  def self.get_response_intake_form(params)
    filter_by_client(params[:client_id])
  end

  private

  def self.filter_by_client(client_id)
    if client_id.present?
      where(client_id: client_id)
    else
      all
    end
  end
end

class ResponseIntakeForm < ApplicationRecord
  belongs_to :intake_form
  belongs_to :client

  validates :response_form_data, presence: { message: "Response form data can't be blank"  }

  def self.client_response_intake_forms(current_client)
    if current_client.present?
      where(client_id: current_client.id)
    else
      all
    end
  end
end

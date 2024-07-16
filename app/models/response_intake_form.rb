class ResponseIntakeForm < ApplicationRecord
  belongs_to :intake_form
  belongs_to :client

  validates :response_form_data, presence: { message: "Response form data can't be blank"  }
end

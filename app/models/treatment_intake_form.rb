class TreatmentIntakeForm < ApplicationRecord
  belongs_to :treatment
  belongs_to :intake_form
end

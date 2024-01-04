class Schedule < ApplicationRecord
  belongs_to :client
  belongs_to :employee
  belongs_to :product, optional: true
  belongs_to :treatment
end

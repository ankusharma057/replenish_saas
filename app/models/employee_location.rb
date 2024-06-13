class EmployeeLocation < ApplicationRecord
  belongs_to :employee
  belongs_to :location
  has_many :availabilitities, dependent: :destroy
end

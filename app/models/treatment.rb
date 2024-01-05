class Treatment < ApplicationRecord
  belongs_to :product
  has_many :schedules
end

class ScheduleProduct < ApplicationRecord
  belongs_to :schedule
  belongs_to :product

  validates :quantity, numericality: { greater_than: 0 }
end

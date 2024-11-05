class ScheduleProduct < ApplicationRecord
  belongs_to :schedule
  belongs_to :product
end

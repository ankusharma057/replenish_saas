class Payment < ApplicationRecord
  belongs_to :client
  belongs_to :schedule, optional: true
end

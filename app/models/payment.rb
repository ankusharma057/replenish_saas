class Payment < ApplicationRecord
  belongs_to :client
  belongs_to :schedule, optional: true
  
  belongs_to :schedule_product, optional: true
  belongs_to :schedule_treatment, optional: true
end

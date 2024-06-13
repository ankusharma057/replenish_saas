class Availabilities < ApplicationRecord
  belongs_to :employee_location
  has_many :availability_timings, dependent: :destroy

  accepts_nested_attributes_for :availability_timings 
end
class Location < ApplicationRecord
  has_many :employee_locations
  has_many :employees, through: :employee_locations

  validates :name, presence: true, uniqueness: true
end

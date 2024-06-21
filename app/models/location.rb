class Location < ApplicationRecord
  has_many :employee_locations
  has_many :employees, through: :employee_locations

  validates :name, presence: true, uniqueness: true

  private

  def self.exclude_locations_for_employee(employee_id)
    employee_id.blank? ? all : where.not(id: EmployeeLocation.where(employee_id: employee_id).map(&:location_id).uniq)
  end
end

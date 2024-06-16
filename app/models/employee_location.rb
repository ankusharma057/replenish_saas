class EmployeeLocation < ApplicationRecord
  belongs_to :employee
  belongs_to :location
  has_many :availabilitities, dependent: :destroy

  def self.find_by_employee_or_location(employee_id, location_id=nil)
    if location_id.present?
      where(employee_id: employee_id, location_id: location_id)
    else
      where(employee_id: employee_id)
    end
  end
end

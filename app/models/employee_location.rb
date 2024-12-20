class EmployeeLocation < ApplicationRecord
  belongs_to :employee
  belongs_to :location
  has_many :availabilities, dependent: :destroy, class_name: "Availabilities"

  validates_uniqueness_of :employee_id, scope: :location_id
  acts_as_list scope: :employee


  def self.find_by_employee_or_location(employee_id, location_id=nil)
    if location_id.present?
      where(employee_id: employee_id, location_id: location_id)
    else
      where(employee_id: employee_id)
    end
  end
end

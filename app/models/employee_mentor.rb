class EmployeeMentor < ApplicationRecord
  belongs_to :employee, class_name: "Employee", optional: true
  belongs_to :mentor, class_name: "Employee"

  validates_uniqueness_of :employee_id, scope: :mentor_id
end

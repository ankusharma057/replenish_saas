class EmployeeClient < ApplicationRecord
  belongs_to :employee
  belongs_to :client
end

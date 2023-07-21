# frozen_string_literal: true

class EmployeeInventory < ApplicationRecord
  self.table_name = "employees_inventories"

  include Storage

  belongs_to :employee
  belongs_to :product
end

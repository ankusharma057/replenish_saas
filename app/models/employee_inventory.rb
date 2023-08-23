# frozen_string_literal: true

class EmployeeInventory < ApplicationRecord
  self.table_name = "employees_inventories"

  include Storage

  belongs_to :employee
  belongs_to :product

  private

  # def notify_on_create_update_or_delete
  #   text = "The Employee Inventory for #{product.name} has been"
  #   action_prompt = if new_record?
  #       "created."
  #     elsif quantity_changed?
  #       "updated to quantity: #{quantity}."
  #     else
  #       "deleted."
  #     end

  #   send_message (text + action_prompt)
  # end
end

class Inventory < ApplicationRecord
  self.table_name = 'inventories'

  belongs_to :product
  has_many :inventory_requests

  include Storage

  def prompt_to_employee(employee, quantity)
    current_inventory = self.class.where(product: self.product).first
    current_inventory.update!(quantity: current_inventory.quantity.to_i - quantity.to_i)
    employee.inventory_prompts.create!(product: self.product, quantity: quantity.to_i)
  end

  def request_for_inventory(requestor_employee, quantity_asked, date_of_use)
    inventory_requests.create!(requestor: requestor_employee, quantity_asked: quantity_asked, date_of_use: date_of_use)
  end
end

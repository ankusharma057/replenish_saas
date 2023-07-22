# frozen_string_literal: true

class InventoryRequest < ApplicationRecord
  belongs_to :requestor, foreign_key: :requestor_id, class_name: "Employee"
  belongs_to :inventory

  def accept!
    return false if inventory.quantity.to_f < quantity_asked.to_i

    update!(is_approved: true)
    requestor_inventory = requestor.employees_inventories.find_or_create_by(product: inventory.product)
    requestor_inventory.update!(quantity: (requestor_inventory.quantity.to_f + quantity_asked.to_i))

    inventory.update!(quantity: (inventory.quantity.to_f - quantity_asked.to_i))
  end
end

# frozen_string_literal: true

class InventoryRequest < ApplicationRecord
  belongs_to :requestor, foreign_key: :requestor_id, class_name: "Employee"
  belongs_to :inventory

  def accept!
    return false if inventory.quantity.to_f < quantity_asked.to_f

    update!(is_approved: true)
    requestor_inventory = requestor.employees_inventories.find_or_create_by(product: inventory.product)
    requestor_inventory.update!(quantity: (requestor_inventory.quantity.to_f + quantity_asked.to_f))

    inventory.update!(quantity: (inventory.quantity.to_f - quantity_asked.to_f))
  end

  def product
    inventory.product
  end

  # def notify_on_create_update_or_delete
  #   text = if new_record?
  #       "A request for the inventory assignment for #{product.name} has been created by #{requestor&.name.capitalize}."
  #     else
  #       "The Inventory Request for #{product.name} has been #{is_approved_changed? ? 'accepted' : 'denied'}."
  #     end

  #   send_message(text: text)
  # end
end

# frozen_string_literal: true

class InventoryPrompt < ApplicationRecord
  belongs_to :employee
  belongs_to :product

  def accept!
    update!(is_accepted: true)

    assigned_inventory = employee.employees_inventories.find_or_create_by(product: product)
    assigned_inventory.update!(quantity: (assigned_inventory.quantity.to_f + self.quantity.to_f))
  end

  def reject!
    assignor =  case assigned_by
                when "Inventory Manager"
                  Inventory
                else
                  Employee.find_by(name: assigned_by).employees_inventories
                end.find_or_create_by(product: product)

    assignor.update!(quantity: assignor.quantity.to_f + quantity.to_f)

    destroy!
  end

  private

  # def notify_on_create_and_update
  #   text = if new_record?
  #       "A prompt for the inventory assignment for #{product.name} has been sent to #{employee&.name.capitalize}" 
  #     else
  #       "The Inventory for #{product.name} has been #{is_accepted_changed? ? 'accepted' : 'denied'} by #{employee&.name.capitalize}"
  #     end

  #   send_message text
  # end
end

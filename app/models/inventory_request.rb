# frozen_string_literal: true

class InventoryRequest < ApplicationRecord
  belongs_to :employee, foreign_key: :requestor_id
  belongs_to :product

  def accept!
    binding.irb
    # update!(is_accepted: true)
    # assigned_inventory = employee.employees_inventories.find_or_create_by(product: product)
    # assigned_inventory.update!(quantity: (assigned_inventory.quantity.to_i + self.quantity.to_i))
  end

  def reject!
    # assignor =  case assigned_by
    #             when "Inventory Manager"
    #               Inventory
    #             else
    #               Employee.find_by(name: assigned_by).employees_inventories
    #             end.find_or_create_by(product: product)

    # assignor.update!(quantity: assignor.quantity.to_i + quantity.to_i)

    # destroy!
  end
end

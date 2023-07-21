# frozen_string_literal: true

class InventoryRequest < ApplicationRecord
  belongs_to :requestor, foreign_key: :requestor_id, class_name: "Employee"
  belongs_to :inventory

  def accept!
    update!(is_approved: true)
    # requested_inventory = 
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

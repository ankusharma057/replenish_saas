class InventorySerializer < ActiveModel::Serializer
  attributes :id, :product, :quantity

  attribute :replenish_total_inventory do |record|
    product = record.object.product
    if product.association(:employees_inventories).loaded?
      total_employee_inventory = product.employees_inventories.map(&:quantity).map(&:to_f).inject(0, :+)
    else
      total_employee_inventory = EmployeeInventory.where(product_id: product.id).sum(:quantity).to_f
    end
    record.object.quantity.to_f + total_employee_inventory
  end
end

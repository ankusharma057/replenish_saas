class InventorySerializer < ActiveModel::Serializer
  attributes :id, :product, :quantity

  attribute :available_inventory do |record, params|
    EmployeeInventory.where(product: record.object&.product).first&.quantity
  end
end

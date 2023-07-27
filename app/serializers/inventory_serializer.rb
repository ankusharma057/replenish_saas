class InventorySerializer < ActiveModel::Serializer
  attributes :id, :product, :quantity

  attribute :replenish_total_inventory do |record, params|
    record.object.quantity.to_f +
      EmployeeInventory.where(product: record.object&.product).pluck(:quantity)
        .map(&:to_f).inject(:+).to_f
  end
end

class InventoryRequestSerializer < ActiveModel::Serializer
  attributes :id, :requestor, :quantity_asked, :date_of_use, :is_approved, :inventory
  belongs_to :inventory

  attribute :inventory do |record, params|
    InventorySerializer.new(record.object.inventory)
  end
end

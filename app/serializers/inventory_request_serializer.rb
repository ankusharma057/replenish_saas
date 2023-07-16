class InventoryRequestSerializer < ActiveModel::Serializer
  attributes :id, :requestor, :product, :quantity, :date_of_use
end

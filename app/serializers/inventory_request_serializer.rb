class InventoryRequestSerializer < ActiveModel::Serializer
  attributes :id, :requestor, :inventory, :quantity_asked, :date_of_use
end

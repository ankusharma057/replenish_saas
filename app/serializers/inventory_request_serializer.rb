class InventoryRequestSerializer < ActiveModel::Serializer
  attributes :id, :requestor, :quantity_asked, :date_of_use, :is_approved
  belongs_to :inventory
end

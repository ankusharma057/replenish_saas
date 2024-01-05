class ProductSerializer < ActiveModel::Serializer
  attributes :id, :name, :product_type, :cost_price, :retail_price, :inventory_prompts
  has_many :invoices
  has_many :treatments
end

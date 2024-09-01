class ProductSerializer < ActiveModel::Serializer
  attributes :id, :name, :product_type, :cost_price, :retail_price, :provider_purchased, :inventory_prompts, :duration
  has_many :invoices
  has_many :treatments

  def duration
    object.treatments&.last&.duration
  end
end

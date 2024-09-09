class ScheduleTreatmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :duration, :cost, :quantity, :product

  def product
    {
      id: object.product.id,
      name: object.product.name,
      product_type: object.product.product_type
    }
  end
end
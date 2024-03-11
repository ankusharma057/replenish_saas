class EmployeeInventorySerializer < ActiveModel::Serializer
  attributes :id, :employee, :product, :quantity

  def product    
    object.product.as_json.merge({duration: (object.product&.treatments&.last&.duration || 30)})
  end
end

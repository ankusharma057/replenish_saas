class TreatmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :cost, :products_used, :duration, :employee, :product
end

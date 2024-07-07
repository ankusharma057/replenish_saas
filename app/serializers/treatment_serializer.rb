class TreatmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :cost, :quantity, :duration, :employee, :product
end

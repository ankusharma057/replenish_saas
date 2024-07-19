class TreatmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :cost, :quantity, :duration, :employee, :product
  has_many :treatment_intake_forms, Serializer: TreatmentIntakeFormSerializer
end

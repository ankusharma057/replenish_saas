class QuestionnaireSerializer < ActiveModel::Serializer
  attributes :id, :name, :template, :employee
end
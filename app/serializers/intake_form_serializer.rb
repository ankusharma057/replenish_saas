class IntakeFormSerializer < ActiveModel::Serializer
  attributes :id, :name, :prompt_type, :effective_date, :valid_for, :introduction, :form_data, :submitted, :employee, :treatments
end

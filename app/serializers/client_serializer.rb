class ClientSerializer < ActiveModel::Serializer
  attributes :id, :name, :employee_id, :email
end

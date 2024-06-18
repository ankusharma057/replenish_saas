class ClientSerializer < ActiveModel::Serializer
  attributes :id, :name, :employee_ids, :email
end

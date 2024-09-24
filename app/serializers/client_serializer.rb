class ClientSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :address, :phone_number
end

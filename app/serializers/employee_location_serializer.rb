class EmployeeLocationSerializer < ActiveModel::Serializer
  attributes :id, :employee, :location
end
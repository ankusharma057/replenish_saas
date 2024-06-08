class EmployeeMentorSerializer < ActiveModel::Serializer
  attributes :id, :employee, :mentor, :mentor_percentage
end

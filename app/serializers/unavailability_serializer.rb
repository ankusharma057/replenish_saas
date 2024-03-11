class UnavailabilitySerializer < ActiveModel::Serializer
  attributes :id, :employee_id, :start_time, :end_time, :available, :every_week
end

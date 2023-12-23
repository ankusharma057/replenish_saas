class ScheduleSerializer < ActiveModel::Serializer
  attributes :id, :client_id, :product_id, :employee_id, :product_type, :treatment, :start_time, :end_time, :date
end

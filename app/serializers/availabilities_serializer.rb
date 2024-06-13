class AvailabilitiesSerializer < ActiveModel::Serializer
  attributes :id, :availability_date, :employee_location_id

  has_many :availability_timings
end

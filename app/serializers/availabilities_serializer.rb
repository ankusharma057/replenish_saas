class AvailabilitiesSerializer < ActiveModel::Serializer
  attributes :id, :availability_date, :location

  has_many :availability_timings

  def location
    object.employee_location.location
  end
end

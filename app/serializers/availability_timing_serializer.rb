class AvailabilityTimingSerializer < ActiveModel::Serializer
  attributes :id, :start_time, :end_time

  def start_time
    object.start_time&.strftime("%I:%M %p")
  end

  def end_time
    object.end_time&.strftime("%I:%M %p")
  end
end

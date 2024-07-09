class ScheduleSerializer < ActiveModel::Serializer
  attributes :id, :client, :product, :employee, :product_type, :treatment, :start_time, :end_time, :date, :total_amount, :paid_amount, :remaining_amount, :reminder, :location

  def total_amount
    object.amount
  end

  def remaining_amount
    object.remaining_amt
  end

  def paid_amount
    object.paid_amt
  end

  def location
    object.location
  end
end

class ScheduleSerializer < ActiveModel::Serializer
  attributes :id, :client, :products, :employee, :product_type, :treatments, :start_time, :end_time, :date, :total_amount, :paid_amount, :remaining_amount, :reminder, :location, :notes
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

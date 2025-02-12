class ScheduleSerializer < ActiveModel::Serializer
  attributes :id, :client, :employee, :products, :product_type, :treatments, :start_time, :end_time, :date, :total_amount, :paid_amount, :remaining_amount, :reminder, :location, :notes
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

  def products
    object.schedule_products.map do |schedule_product|
      {
        id: schedule_product.product.id,
        schedule_product_id: schedule_product.id,
        name: schedule_product.product.name,
        product_type: schedule_product.product.product_type,
        cost_price: schedule_product.product.cost_price,
        retail_price: schedule_product.product.retail_price,
        quantity: schedule_product.quantity,
        total_amt: schedule_product.total_amt,
        paid_amt: schedule_product.paid_amt,
        remaining_amt: schedule_product.remaining_amt,
        paid: schedule_product.remaining_amt.zero?,
        payment_intent: schedule_product.payment_intent
      }
    end
  end

  def treatments
    object.schedule_treatments.map do |schedule_treatment|
      {
        id: schedule_treatment.treatment.id,
        schedule_treatment_id: schedule_treatment.id,
        name: schedule_treatment.treatment.name,
        cost: schedule_treatment.treatment.cost,
        total_amt: schedule_treatment.total_amt,
        paid_amt: schedule_treatment.paid_amt,
        remaining_amt: schedule_treatment.remaining_amt,        
        paid: schedule_treatment.remaining_amt.zero?,
        payment_intent: schedule_treatment.payment_intent
      } 
    end
  end
end

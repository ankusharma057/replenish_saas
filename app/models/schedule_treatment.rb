class ScheduleTreatment < ApplicationRecord
  belongs_to :schedule
  belongs_to :treatment
  has_many :payments, foreign_key: :schedule_treatment_id, dependent: :destroy

  def paid_amt
    payments.where(status: 'paid').pluck(:amount).map(&:to_f).sum
  end

  def remaining_amt
    total_amt - paid_amt
  end

  def total_amt
    treatment.cost
  end

  def payment_intent
    first_payment = payments.first
    session_id = first_payment&.session_id
    session_id ? Stripe::Checkout::Session.retrieve(session_id).payment_intent : nil
  end
end

class AddScheduleProductAndScheduleTreatmentToPayments < ActiveRecord::Migration[7.0]
  def change
    add_reference :payments, :schedule_product, null: true, foreign_key: true
    add_reference :payments, :schedule_treatment, null: true, foreign_key: true
  end
end

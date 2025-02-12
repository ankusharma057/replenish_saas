class CreateScheduledPayments < ActiveRecord::Migration[7.0]
  def change
    create_table :scheduled_payments do |t|
      t.integer :employee_id
      t.integer :invoice_id
      t.integer :total_amount
      t.datetime :scheduled_at

      t.timestamps
    end
  end
end

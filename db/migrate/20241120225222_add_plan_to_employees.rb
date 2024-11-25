class AddPlanToEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :plan, :string, null: true
    add_column :employees, :stripe_customer_id, :string
    add_column :employees, :subscription_status, :string
    add_column :employees, :subscription_ends_at, :datetime
  end
end

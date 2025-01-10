class AddStripeAccountIdToEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :stripe_account_id, :string
  end
end

class AddStripeAccountIdToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :stripe_account_id, :string
  end
end

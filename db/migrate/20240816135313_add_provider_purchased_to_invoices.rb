class AddProviderPurchasedToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :provider_purchased, :boolean
  end
end

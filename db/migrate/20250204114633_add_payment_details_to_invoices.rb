class AddPaymentDetailsToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :payment_type, :integer
    add_column :invoices, :amt_paid_for_products, :float
    add_column :invoices, :amt_paid_for_retail_products, :float
    add_column :invoices, :amt_paid_for_wellness_products, :float
    add_column :invoices, :amt_paid_for_mp_products, :float
  end
end

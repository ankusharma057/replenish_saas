class AddPaymentStatusToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :payment_status, :string
  end
end

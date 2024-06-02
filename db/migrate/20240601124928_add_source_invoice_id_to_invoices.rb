class AddSourceInvoiceIdToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :source_invoice_id, :integer
  end
end

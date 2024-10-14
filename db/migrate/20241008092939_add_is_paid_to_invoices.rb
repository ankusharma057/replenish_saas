class AddIsPaidToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :is_paid, :boolean, default: false, null: false
  end
end

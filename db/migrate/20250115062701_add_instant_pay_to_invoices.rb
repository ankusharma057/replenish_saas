class AddInstantPayToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :instant_pay, :boolean, default: false, null: false
  end
end

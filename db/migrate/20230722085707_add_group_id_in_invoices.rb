class AddGroupIdInInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :invoice_group_id, :integer
  end
end

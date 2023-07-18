class UpdateDataTypeInInvoices < ActiveRecord::Migration[7.0]
  def change
    change_column :invoices, :overhead_fee_value, :float
  end
end

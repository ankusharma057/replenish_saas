class AddTotalConsumableCostInInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :total_consumable_cost, :float    
  end
end

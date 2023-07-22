class CreateInvoiceGroups < ActiveRecord::Migration[7.0]
  def change
    create_table :invoice_groups do |t|
      t.boolean :finalized_totally, default: false 

      t.timestamps
    end
  end
end

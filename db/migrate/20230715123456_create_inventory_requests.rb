class CreateInventoryRequests < ActiveRecord::Migration[7.0]
  def change
    create_table :inventory_requests do |t|
      t.integer :requestor_id
      t.integer :product_id
      t.integer :quantity
      t.datetime :date_of_use

      t.timestamps
    end
  end
end

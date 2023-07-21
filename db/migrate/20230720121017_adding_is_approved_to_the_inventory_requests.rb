class AddingIsApprovedToTheInventoryRequests < ActiveRecord::Migration[7.0]
  def change
    rename_column :inventory_requests, :quantity, :quantity_asked
    remove_column :inventory_requests, :product_id, :integer
    add_column :inventory_requests, :is_approved, :boolean, default: false
    add_column :inventory_requests, :inventory_id, :integer
  end
end

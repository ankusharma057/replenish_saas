class ChangeTheQuantitiesToFloatValues < ActiveRecord::Migration[7.0]
  def change
    change_column :employees_inventories, :quantity, :float
    change_column :inventories, :quantity, :float
    change_column :inventory_prompts, :quantity, :float
    change_column :inventory_requests, :quantity_asked, :float
  end
end

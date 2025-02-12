class AddQuantityToScheduleProducts < ActiveRecord::Migration[7.0]
  def change
    add_column :schedule_products, :quantity, :integer, null: false, default: 1
  end
end

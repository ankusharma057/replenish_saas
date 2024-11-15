class AddPurchasedTypeToProducts < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :purchased_type, :integer, default: 0
  end
end

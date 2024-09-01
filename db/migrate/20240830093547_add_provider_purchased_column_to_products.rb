class AddProviderPurchasedColumnToProducts < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :provider_purchased, :boolean, default: false
  end
end

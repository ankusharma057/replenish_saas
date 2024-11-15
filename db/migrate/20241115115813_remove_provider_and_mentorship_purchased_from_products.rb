class RemoveProviderAndMentorshipPurchasedFromProducts < ActiveRecord::Migration[7.0]
  def change
    remove_column :products, :provider_purchased, :boolean
  end
end

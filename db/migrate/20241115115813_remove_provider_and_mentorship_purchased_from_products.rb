class RemoveProviderAndMentorshipPurchasedFromProducts < ActiveRecord::Migration[7.0]
  def change
    remove_column :products, :provider_purchased, :boolean
    remove_column :products, :mentorship_purchased, :boolean
  end
end

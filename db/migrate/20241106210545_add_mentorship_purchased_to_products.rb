class AddMentorshipPurchasedToProducts < ActiveRecord::Migration[7.0]
  def change
    add_column :products, :mentorship_purchased, :boolean, default: false
  end
end

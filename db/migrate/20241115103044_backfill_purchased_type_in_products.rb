class BackfillPurchasedTypeInProducts < ActiveRecord::Migration[7.0]
  def up
    Product.reset_column_information
    Product.find_each do |product|
      if product.provider_purchased
        product.update_column(:purchased_type, 1)
      else
        product.update_column(:purchased_type, 0)
      end
    end
  end

  def down
    Product.update_all(purchased_type: 0)
  end
end

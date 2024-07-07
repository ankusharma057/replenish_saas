class RenameProductsUsedToQuantityInTreatments < ActiveRecord::Migration[7.0]
  def change
    rename_column :treatments, :products_used, :quantity
  end
end

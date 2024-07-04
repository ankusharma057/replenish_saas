class AddColumnToTreatments < ActiveRecord::Migration[7.0]
  def change
    add_column :treatments, :created_by, :integer
    add_column :treatments, :description, :text
    add_column :treatments, :cost, :float
    add_column :treatments, :products_used, :integer
  end
end

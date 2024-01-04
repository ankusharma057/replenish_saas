class CreateTreatments < ActiveRecord::Migration[7.0]
  def change
    create_table :treatments do |t|
      t.string :name
      t.string :duration
      t.references :product

      t.timestamps
    end
  end
end

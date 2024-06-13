class CreateAvailabilities < ActiveRecord::Migration[7.0]
  def change
    create_table :availabilities do |t|
      t.date :availability_date
      t.references :employee_location, null: false, foreign_key: true

      t.timestamps
    end
  end
end

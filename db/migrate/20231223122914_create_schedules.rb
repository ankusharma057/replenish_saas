class CreateSchedules < ActiveRecord::Migration[7.0]
  def change
    create_table :schedules do |t|
      t.string :product_type
      t.string :treatment
      
      t.datetime :start_time
      t.datetime :end_time
      t.datetime :date
      
      t.references :employee, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true

      t.timestamps
    end
  end
end

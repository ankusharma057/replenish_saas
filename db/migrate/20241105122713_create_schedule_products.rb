class CreateScheduleProducts < ActiveRecord::Migration[7.0]
  def change
    create_table :schedule_products do |t|
      t.references :schedule, null: false, foreign_key: true
      t.references :product, null: false, foreign_key: true

      t.timestamps
    end
  end
end

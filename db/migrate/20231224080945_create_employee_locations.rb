class CreateEmployeeLocations < ActiveRecord::Migration[7.0]
  def change
    create_table :employee_locations do |t|
      t.references :employee, null: false, foreign_key: true
      t.references :location, null: false, foreign_key: true

      t.timestamps
    end
  end
end

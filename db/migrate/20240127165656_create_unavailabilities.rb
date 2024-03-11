class CreateUnavailabilities < ActiveRecord::Migration[7.0]
  def change
    create_table :unavailabilities do |t|
      t.datetime :start_time
      t.datetime :end_time
      t.boolean :available
      t.references :employee, null: false, foreign_key: true

      t.timestamps
    end
  end
end

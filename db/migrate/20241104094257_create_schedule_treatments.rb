class CreateScheduleTreatments < ActiveRecord::Migration[7.0]
  def change
    create_table :schedule_treatments do |t|
      t.references :schedule, null: false, foreign_key: true
      t.references :treatment, null: false, foreign_key: true

      t.timestamps
    end
  end
end

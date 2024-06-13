class CreateAvailabilityTiming < ActiveRecord::Migration[7.0]
  def change
    create_table :availability_timings do |t|
      t.time :start_time
      t.time :end_time
      t.references :availabilities, null: false, foreign_key: true

      t.timestamps
    end
  end
end

class AddColumnIntoSchedules < ActiveRecord::Migration[7.0]
  def change
    add_column :schedules, :location_id, :integer
  end
end

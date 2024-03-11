class AddRemainderIntoSchedule < ActiveRecord::Migration[7.0]
  def change
    add_column :schedules, :remainder, :string, array: true, default: []
  end
end

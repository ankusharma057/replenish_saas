class AddColumnsToSchedules < ActiveRecord::Migration[7.0]
  def change
    add_column :schedules, :cancelled_by, :integer
    add_column :schedules, :cancelled_at, :datetime
    add_column :schedules, :is_cancelled, :boolean, default: false
  end
end

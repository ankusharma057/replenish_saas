class RenameRemainderToReminderInSchedule < ActiveRecord::Migration[7.0]
  def change
    rename_column :schedules, :remainder, :reminder
  end
end

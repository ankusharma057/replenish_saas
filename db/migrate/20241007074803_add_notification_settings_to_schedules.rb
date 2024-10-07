class AddNotificationSettingsToSchedules < ActiveRecord::Migration[7.0]
  def change
    add_column :schedules, :notification_settings, :jsonb
  end
end

class RemoveDefaultFromNotificationSettingsInClients < ActiveRecord::Migration[7.0]
  def change
    change_column_default :clients, :notification_settings, from: {}, to: nil
  end
end

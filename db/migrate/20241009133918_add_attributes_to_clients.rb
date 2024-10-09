class AddAttributesToClients < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :notification_settings, :jsonb, default: {}
    add_column :clients, :online_Booking_Policy, :string
    add_column :clients, :online_Booking_Payment_Policy, :string
    add_column :clients, :how_heard_about_us, :string
    add_column :clients, :referred_employee_id, :integer
  end
end

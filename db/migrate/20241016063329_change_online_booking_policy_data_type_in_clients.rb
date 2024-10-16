class ChangeOnlineBookingPolicyDataTypeInClients < ActiveRecord::Migration[7.0]
  def change
    change_column :clients, :online_booking_policy, :text, null: true
    change_column :clients, :online_booking_policy, :jsonb, null: true, using: 'online_booking_policy::jsonb'
    change_column :clients, :online_booking_payment_policy, :text, null: true
    change_column :clients, :online_booking_payment_policy, :jsonb, null: true, using: 'online_booking_payment_policy::jsonb'
  end
end

class RenameOnlineBookingPolicyColumns < ActiveRecord::Migration[7.0]
  def change
    rename_column :clients, :online_Booking_Policy, :online_booking_policy
    rename_column :clients, :online_Booking_Payment_Policy, :online_booking_payment_policy
  end
end

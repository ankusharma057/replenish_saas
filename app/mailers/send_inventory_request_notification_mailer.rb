# frozen_string_literal: true

class SendInventoryRequestNotificationMailer < ApplicationMailer
  def send_notification
    @inventory_request = params[:inventory_request]

    admin_emails = Employee.admins.map(&:email)

	mail(
      from: 'patrick@test.com',
      to: admin_emails,
      subject: "Inventory Request"
    ) do |format|
      format.html { render "layouts/inventory_request_email" }
    end
  end
end

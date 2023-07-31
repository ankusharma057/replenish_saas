# frozen_string_literal: true

class SendInventoryRequestNotificationMailer < ApplicationMailer
  def send_notification
    @inventory_request = params[:inventory_request]

    emails = []
    emails << Employee.admins.map(&:email)
    emails << inventory_manager_emails
    emails.uniq!

	  mail(
      from: 'patrick@test.com',
      to: emails,
      subject: "Inventory Request"
    ) do |format|
      format.html { render "layouts/inventory_request_email" }
    end
  end

  def inventory_manager_emails
    Employee.inv_managers.select do |employee|
      employee.has_access_only_to == ("all" || @inventory_request.product.product_type)
    end.map(&:email)
  end
end

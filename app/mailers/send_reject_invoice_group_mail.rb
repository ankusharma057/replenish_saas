# frozen_string_literal: true

class SendRejectInvoiceGroupMail < ApplicationMailer
  def send_group_rejection_mail
    @invoice = params[:invoice]

    mail(
      from: 'patrick@test.com',
      to: @invoice.employee.email,
      subject: "Invoice created."
    ) do |format|
      format.html { render "layouts/invoice_group_rejection_email" }
    end
  end
end

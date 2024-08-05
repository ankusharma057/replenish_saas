# frozen_string_literal: true

class SendNotificationPdfToAdminsMailer < ApplicationMailer
  def send_mail
    admin_emails = ["info@replenishmd.com"]
    @invoice_group = params[:group]
    @invoices = params[:invoices]

    attachments["#{@invoices.first.employee.name}-Non-Finalized-Invoices-#{@invoices.ids}-#{DateTime.now.strftime('%d/%m/%y')}.pdf"] = @invoice_group.document.download
    admin_emails << @invoices.first.employee.email

    mail(
      from: 'patrick@test.com',
      to: admin_emails,
      subject: "Invoice created."
    ) do |format|
      format.html { render "layouts/prompt_email" }
    end
  end
end

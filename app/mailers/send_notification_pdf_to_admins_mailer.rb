# frozen_string_literal: true

class SendNotificationPdfToAdminsMailer < ApplicationMailer
  def send_mail
    admin_emails = Employee.admins.map(&:email)
    @invoice_group = params[:group]

    attachments["#{@invoice_group.invoices.first.employee.name}-Non-Finalized-Invoices-#{@invoice_group.invoices.ids}-#{DateTime.now.strftime('%d/%m/%y')}.pdf"] = @invoice_group.document.download
    admin_emails << @invoice_group.invoices.first.employee.email

    mail(
      from: 'patrick@test.com',
      to: admin_emails,
      subject: "Invoice created."
    ) do |format|
      format.html { render "layouts/prompt_email" }
    end
  end
end

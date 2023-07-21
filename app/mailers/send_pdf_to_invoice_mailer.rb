# frozen_string_literal: true

class SendPdfToInvoiceMailer < ApplicationMailer
  def send_mail
    @invoice = params[:invoice]
    attachments["#{@invoice.client.name}-Finalized-Invoice-#{@invoice.id}.pdf"] = @invoice.document.download

    emails = Employee.admins.map(&:email)
    emails << @invoice.employee.email
    emails << "replenishmd_527@invoicesmelio.com"

    mail(
      from: 'patrick@test.com',
      to: emails,
      subject: "Invoice Attachment."
    ) do |format|
      format.html { render "layouts/invoice_email" }
    end
  end
end

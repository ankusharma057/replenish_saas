# frozen_string_literal: true

class SendPdfToInvoiceMailer < ApplicationMailer
  def send_mail
    @invoice = params[:invoice]
    attachments["#{@invoice.client.name}-Finalized-Invoice-#{@invoice.id}.pdf"] = @invoice.document.download

    emails = Employee.admins.pluck(&:email)
    emails << @invoice.employee.email
    emails << "patrick.lc17@icloud.com"

    emails.each do |email|
      mail(
        from: 'patrick@test.com',
        to: email,
        subject: "Invoice Attachment."
      ) do |format|
        format.html { render "layouts/invoice_email" }
      end
    end
  end
end

# frozen_string_literal: true

class SendPdfToInvoiceMailer < ApplicationMailer
  def send_mail
    @invoice_group = params[:group]

    attachments["#{@invoice_group.invoices.first.employee.name}-Finalized-Invoices-#{@invoice_group.invoices.ids}-#{DateTime.now.strftime('%d/%m/%y')}.pdf"] = @invoice_group.document.download

    emails = Employee.admins.map(&:email)
    emails << @invoice_group.invoices.first.employee.email
    # emails << "replenishmd_527@invoicesmelio.com"

    mail(
      from: 'patrick@test.com',
      to: emails,
      subject: "Invoice Attachment."
    ) do |format|
      format.html { render "layouts/invoice_email" }
    end
  end
end

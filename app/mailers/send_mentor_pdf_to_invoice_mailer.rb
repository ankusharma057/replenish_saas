# frozen_string_literal: true

class SendMentorPdfToInvoiceMailer < ApplicationMailer
  def send_mail
    @invoice_group = params[:group]
    @invoices = params[:invoices]

    attachments["#{@invoices.first.employee.name}-Finalized-Invoices-#{@invoices.ids}-#{DateTime.now.strftime('%d/%m/%y')}.pdf"] = @invoice_group.document.download

    emails = []
    emails << @invoices.map { |invoice| invoice.employee.mentors.pluck(:email) }.flatten.uniq
    emails << "replenishmd_527@invoicesmelio.com"
    emails << "info@replenishmd.com"

    mail(
      from: 'patrick@test.com',
      to: emails,
      subject: "Invoice Attachment."
    ) do |format|
      format.html { render "layouts/mentor_invoice_email" }
    end
  end
end

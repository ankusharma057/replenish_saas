class InvoiceMailer < ApplicationMailer
  def send_invoice(invoices, recipient_email)
    @invoices = invoices
    pdf_html = ActionController::Base.new.render_to_string(
      template: 'api/invoices/print_receipt',
      assigns: { invoices: @invoices },
      layout: 'pdf'
    )
    pdf = WickedPdf.new.pdf_from_string(pdf_html)
    attachments["Invoices.pdf"] = pdf
    mail(to: recipient_email, subject: 'Your Invoice Receipt')
  end
end

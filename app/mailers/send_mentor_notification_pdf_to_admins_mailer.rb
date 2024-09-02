# frozen_string_literal: true

class SendMentorNotificationPdfToAdminsMailer < ApplicationMailer
  def send_mail
    emails = ["info@replenishmd.com"]
    @invoice_group = params[:group]
    @invoices = params[:invoices]

    attachments["#{@invoices.first.employee.name}-Non-Finalized-Invoices-#{@invoices.ids}-#{DateTime.now.strftime('%d/%m/%y')}.pdf"] = @invoice_group.document.download
    emails << @invoices.map { |invoice| invoice.employee.mentors.pluck(:email) }.flatten.uniq 

    mail(
      from: 'patrick@test.com',
      to: emails,
      subject: "Invoice created."
    ) do |format|
      format.html { render "layouts/mentor_prompt_email" }
    end
  end
end

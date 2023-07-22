# frozen_string_literal: true

class SendNotificationPdfToAdminsMailer < ApplicationMailer
  def send_mail
    admins = Employee.admins
    @invoice_group = params[:group]

    attachments["#{@invoice_group.invoices.first.client.name}-Non-Finalized-Invoices-#{@invoice_group.invoices.ids}.pdf"] = @invoice_group.document.download

    admins.each do |admin|
	    mail(
	      from: 'patrick@test.com',
	      to: admin.email,
	      subject: "Invoice created."
	    ) do |format|
	      format.html { render "layouts/prompt_email" }
	    end
    end
  end
end

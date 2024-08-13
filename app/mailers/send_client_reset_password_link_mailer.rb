# frozen_string_literal: true

class SendClientResetPasswordLinkMailer < ApplicationMailer
  def reset_password_mail
    @client = params[:client]

    mail(
      from: 'patrick@test.com',
      to: @client.email,
      subject: "Temporary Password for #{@client.name}"
    ) do |format|
      format.html { render "layouts/client_reset_password_email" }
    end
  end
end

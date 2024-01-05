class InvitationMailer < ApplicationMailer

  def client_invitation
    @client = params[:client]
    mail(
      from: 'patrick@test.com',
      to: @client.email,
      subject: "Invitation",
    )
  end
end

class RemainderMailer < ApplicationMailer

  def client_remainder
    @schedule = Schedule.find_by(id: params[:schedule])
    mail(
      from: 'patrick@test.com',
      to: @schedule.client.email,
      subject: "Gentle Remainder",
    )
  end
end

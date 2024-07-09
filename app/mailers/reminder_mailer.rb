class ReminderMailer < ApplicationMailer

  def client_reminder
    @schedule = Schedule.find_by(id: params[:schedule])
    return unless @schedule

    mail(
      from: 'patrick@test.com',
      to: @schedule.client.email,
      subject: "Gentle Reminder",
    )
  end
end

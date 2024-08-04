class ScheduleMailer < ApplicationMailer
  def client_notification(schedule, client, amount)
    @schedule = schedule
    @client = client
    @amount = amount
    mail(to: @client.email, subject: 'Your Schedule Payment Confirmation')
  end

  def employee_notification(schedule, employee, client, amount)
    @schedule = schedule
    @employee = employee
    @client = client
    @amount = amount
    mail(to: @employee.email, subject: 'New Schedule Payment Confirmation')
  end
end
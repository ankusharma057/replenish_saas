class ScheduleMailer < ApplicationMailer
  def client_notification(schedule, client, amount)
    @schedule = schedule
    @client = client
    @amount = amount
    mail(to: @client.email, subject: "#{@amount == 50 ? 'Your Schedule Payment Confirmation' : 'Your Schedule Creation Confirmation'}")
  end

  def employee_notification(schedule, employee, client, amount)
    @schedule = schedule
    @employee = employee
    @client = client
    @amount = amount
    mail(to: @employee.email, subject: "#{@amount == 50 ? 'New Schedule Payment Confirmation' : 'New Schedule Creation Confirmation'}")
  end
end
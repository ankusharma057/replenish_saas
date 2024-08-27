class ScheduleMailer < ApplicationMailer
  def client_notification(schedule, client, amount)
    @schedule = schedule
    @client = client
    @amount = amount
    emails = build_email_list(@client.email)
    subject = build_subject('Schedule', @amount)
    send_mail(emails, subject, 'client_notification')
  end

  def employee_notification(schedule, employee, client, amount)
    @schedule = schedule
    @employee = employee
    @client = client
    @amount = amount
    emails = build_email_list(@employee.email)
    subject = build_subject('Schedule', @amount)
    send_mail(emails, subject, 'employee_notification')
  end

  def client_schedule_cancelled_notification(schedule, client)
    @schedule = schedule
    @client = client
    emails = build_email_list(@client.email)
    subject = 'Your Schedule Cancelled'
    send_mail(emails, subject, 'client_schedule_cancelled_notification')
  end

  def employee_schedule_cancelled_notification(schedule, employee, client)
    @schedule = schedule
    @employee = employee
    @client = client
    emails = build_email_list(@employee.email)
    subject = 'Your Schedule Cancelled'
    send_mail(emails, subject, 'employee_schedule_cancelled_notification')
  end

  private

  def build_email_list(primary_email)
    [primary_email, "info@replenishmd.com"]
  end

  def build_subject(action, amount)
    amount == 50 ? "New #{action} Payment Confirmation" : "New #{action} Creation Confirmation"
  end

  def send_mail(emails, subject, template_name)
    mail(
      from: 'patrick@test.com',
      to: emails,
      subject: subject
    ) do |format|
      format.html { render template_name }
    end
  end
end
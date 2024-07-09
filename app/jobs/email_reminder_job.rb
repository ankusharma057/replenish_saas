class EmailReminderJob < ApplicationJob
  queue_as :default

  def perform(schedule_id)
    schedule = Schedule.find_by(id: schedule_id)
    return unless schedule
    ReminderMailer.with(schedule: schedule_id).client_reminder.deliver_now
  end
end

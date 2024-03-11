class EmailRemainderJob
  
  include Sidekiq::Job
  def perform(schedule_id)
    RemainderMailer.with(schedule: schedule_id).client_remainder.deliver_now
  end
end

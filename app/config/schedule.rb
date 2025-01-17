set :output, "log/cron.log"

every 1.day, at: '12:00 am' do
  rake "schedule_payment:process", environment: "production"
end

namespace :schedule_payment do
  desc "Process scheduled payments"
  task process: :environment do
    EmployeePaymentProcessor.process_scheduled_payments
  end
end

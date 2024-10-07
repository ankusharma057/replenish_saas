class Schedule < ApplicationRecord
  belongs_to :client
  belongs_to :employee
  belongs_to :product, optional: true
  belongs_to :treatment
  has_many :payments
  belongs_to :location

  before_create :presisted_schedule

  scope :balance_amount, -> { select { |schedule| schedule.remaining_amt > 0 } }

  default_scope { where(is_cancelled: false) }  
  serialize :notification_settings, Hash
  after_initialize :set_default_notification_settings


  def cancel_schedule(data)
    if update(is_cancelled: true, cancelled_by: data.id, cancelled_at: DateTime.now)
      send_cancellation_emails
    else
      Rails.logger.error "Failed to cancel the schedule with ID: #{id}"
      false
    end
  end

  def send_payment_notifications(amount)
    client = self.client
    employee = self.employee
    ScheduleMailer.client_notification(self, client, amount).deliver_now
    ScheduleMailer.employee_notification(self, employee, client, amount).deliver_now
  end

  def presisted_schedule
    res = Schedule.where(start_time: start_time, end_time:  end_time)
    emp_data = res.where(employee_id: employee_id)
    errors.add(:base, 'Employee is already scheduled at this time period.') if emp_data.present?
    client_data = res.where(client_id: client_id)
    errors.add(:base, 'Client is already scheduled at this time period.') if client_data.present? 
  end

  def remaining_amt
    amount - paid_amt.to_d
  end

  def amount
    treatment&.cost.to_f
  end

  def paid_amt
    payments.select { |payment| payment.status == 'paid' }.map { |p| p.amount.to_i }.sum
  end

  def timezone
    client.timezone
  end

  def update_reminder
    data = self.reminder
    return nil if data.blank?
    return 'past schedule' if self.start_time.in_time_zone(timezone) < DateTime.now.in_time_zone(timezone)
    data.each do |evt|
      e = evt.split('_')
      if e.first == "email"
        send_time = self.start_time.in_time_zone(timezone) - e.last.to_i.hours
        EmailReminderJob.set(wait_until: send_time).perform_later(self.id)
      elsif e.first == "text"
      end
    end
  end

  def check_for_inventory
    employee_inventory = self.employee.employees_inventories.where(product_id: self.product_id).first
    employee_inventory ? self.treatment.quantity <= employee_inventory.quantity : false
  end

  def self.client_schedules(client_id)
    return [] unless client_id.present?

    schedules = Schedule.where(client_id: client_id)
                        .includes(:treatment, :client, :location, :payments)

    schedules.map do |schedule|
      {
        id: schedule.id,
        treatment: {
          name: schedule.treatment&.name
        },
        client: {
          name: schedule.client&.name
        },
        location: {
          name: schedule.location&.name
        },
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        total_amount: schedule.amount,
        paid_amount: schedule.paid_amt,
        remaining_amount: schedule.remaining_amt
      }
    end
  end

  private

  def set_default_notification_settings
    self.notification_settings ||= {
      email_reminder_2_days: false,
      sms_reminder_2_days: false,
      sms_reminder_24_hours: false,
      email_new_cancelled: false,
      email_waitlist_openings: false,
      sms_waitlist_openings: false,
      ok_to_send_marketing_emails: false,
      send_ratings_emails: false,
      do_not_email: false
    }
  end

  def send_cancellation_emails
    ScheduleMailer.client_schedule_cancelled_notification(self, client).deliver_now
    ScheduleMailer.employee_schedule_cancelled_notification(self, employee, client).deliver_now
  end
end

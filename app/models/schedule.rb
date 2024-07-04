class Schedule < ApplicationRecord
  belongs_to :client
  belongs_to :employee
  belongs_to :product, optional: true
  belongs_to :treatment
  has_many :payments
  belongs_to :location

  before_create :presisted_schedule

  scope :balance_amount, -> { select { |schedule| schedule.remaining_amt > 0 } }

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
    product.retail_price
  end

  def paid_amt
    payments.where(status: 'paid').map{|a| a.amount.to_i || 0}.sum
  end

  def timezone
    client.timezone
  end

  def update_remainder
    data = self.remainder
    return nil if data.blank?
    return 'past sechdule' if  self.start_time.in_time_zone(timezone) < DateTime.now.in_time_zone(timezone)
    data.each do |evt|
      e = evt.split('_')
      if e.first == "email"
        EmailRemainderJob.perform_at(self.start_time.in_time_zone(timezone) - e.last.to_i.hour, self.id)
      elsif e.first == "text"
      end
    end
  end

  def check_for_inventory
    self.employee.employees_inventories.pluck(:product_id).include?(self.product_id)
  end
end

class Availabilities < ApplicationRecord
  belongs_to :employee_location
  has_many :availability_timings, dependent: :destroy

  accepts_nested_attributes_for :availability_timings, allow_destroy: true

  def self.employee_locations_availabilities(param={})
    param[:from_date] = param[:from_date].present? ? Date.parse(param[:from_date]) : Date.today.beginning_of_month

    if param[:to_date].present?
      Date.parse(param[:to_date])
    elsif param[:from_date].present?
      param[:from_date].end_of_month
    else
      Date.today.end_of_month
    end

    employee_location_ids = EmployeeLocation.find_by_employee_or_location(param[:employee_id], param[:location_id]).pluck(:id)
    includes(:availability_timings, employee_location: [:location]).where(employee_location_id: employee_location_ids, availability_date: param[:from_date]..param[:to_date])
  end
end
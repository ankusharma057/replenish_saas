class Availabilities < ApplicationRecord
  belongs_to :employee_location
  has_many :availability_timings, dependent: :destroy

  accepts_nested_attributes_for :availability_timings

  def self.employee_locations_availabilities(params)
    where(employee_location_id: EmployeeLocation.where(employee_id: params[:employee_id], location_id: params[:location_id]).pluck(:id))
  end
end
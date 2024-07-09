class Location < ApplicationRecord
  has_many :employee_locations
  has_many :employees, through: :employee_locations

  validates :name, presence: true, uniqueness: true

  private

  def self.exclude_locations_for_employee(params)
    if params[:employee_id].present?
      where(id: EmployeeLocation.where(employee_id: params[:employee_id]).map(&:location_id).uniq)
    elsif params[:skip_by_employee_id].present?
      where.not(id: EmployeeLocation.where(employee_id: params[:skip_by_employee_id]).map(&:location_id).uniq)
    else
      all
    end
  end
end

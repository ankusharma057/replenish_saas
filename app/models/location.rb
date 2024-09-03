class Location < ApplicationRecord
  has_many :employee_locations, dependent: :destroy
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

  def employees_with_associations
    employees.includes(
      :inventory_prompts,
      :inventory_requests,
      :employees_inventories,
      :employee_mentors,
      :employee_locations,
      :roles,
      invoices: [
        :before_images_attachments,
        :after_images_attachments,
        :client,
        :invoice_group
      ],
      employees_inventories: [:product],
      employee_locations: [:location]
    )
  end
end

class Treatment < ApplicationRecord
  belongs_to :product
  has_many :schedules, dependent: :destroy
  belongs_to :employee, class_name: 'Employee', foreign_key: :created_by

  scope :base_treatments, -> {
    joins(employee: :roles)
      .where(roles: { name: 'admin' })
  }

  scope :base_treatments_by_employee, -> (employee_id) {
    joins(product: :employees_inventories).where(employees_inventories: { employee_id: employee_id, product_id: 
  base_treatments.map(&:product_id).flatten.uniq })
  }

  def self.filtered_treatments(employee_id)
    if employee_id.present?
      base_treatments_by_employee(employee_id)
    else
      base_treatments
    end
  end

  def self.employee_treatments(employee_id)
    if employee_id.present?
      where(created_by: employee_id)
    else
      { message: "Please pass employee_id" }.to_json
    end
  end
end
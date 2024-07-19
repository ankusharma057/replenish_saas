class Treatment < ApplicationRecord
  belongs_to :product
  has_many :schedules, dependent: :destroy
  belongs_to :employee, class_name: 'Employee', foreign_key: :created_by

  has_many :treatment_intake_forms, dependent: :destroy
  has_many :intake_forms, through: :treatment_intake_forms

  validates :name, :duration, :product_id, :created_by, presence: true
  validates :cost, presence: true, numericality: { greater_than: 0 }
  validates :quantity, presence: true, numericality: { greater_than: 0 }

  accepts_nested_attributes_for :treatment_intake_forms, allow_destroy: true

  scope :base_treatments, -> {
    joins(employee: :roles)
      .where(roles: { name: 'admin' })
  }

  def self.employee_treatments(employee_id)
    if employee_id.present?
      where(created_by: employee_id)
    else
      { message: "Please pass employee_id" }.to_json
    end
  end
end
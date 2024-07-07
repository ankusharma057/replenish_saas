class Treatment < ApplicationRecord
  belongs_to :product
  has_many :schedules, dependent: :destroy
  belongs_to :employee, class_name: 'Employee', foreign_key: :created_by

  validates :name, presence: true
  validates :duration, presence: true
  validates :product_id, presence: true
  validates :cost, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :duration, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :created_by, presence: true

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
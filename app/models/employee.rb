class Employee < ApplicationRecord
  rolify

  attr_accessor :is_admin, :is_inv_manager, :is_mentor

  validates_uniqueness_of :name
  validates_uniqueness_of :email, case_sensitive: false
  validate :verify_employees_mentors

  has_many :invoices
  has_many :products
  has_many :schedules
  has_many :employee_locations
  has_many :locations, through: :employee_locations
  has_many :inventory_prompts, class_name: 'InventoryPrompt', dependent: :destroy
  has_many :inventory_requests, class_name: 'InventoryRequest', foreign_key: :requestor_id, dependent: :destroy
  has_many :employees_inventories, class_name: 'EmployeeInventory', dependent: :destroy
  has_many :unavailabilities, dependent: :destroy

  has_many :employees_mentors, foreign_key: :employee_id, class_name: 'EmployeeMentor', dependent: :destroy
  has_many :mentors, through: :employees_mentors, source: :mentor

  has_many :mentors_employees, foreign_key: :mentor_id, class_name: 'EmployeeMentor', dependent: :destroy
  has_many :mentees, through: :mentors_employees, source: :employee

  has_many :employee_clients
  has_many :clients, through: :employee_clients

  after_create :update_reference
  after_save :update_employee_roles
  before_destroy :return_inventory

  accepts_nested_attributes_for :employees_mentors, allow_destroy: true

  has_secure_password

  ROLES = %w[admin inv_manager mentor]

  %i[admins inv_managers mentors].each do |role|
    scope role.to_sym, -> { role_obj(role.to_s.chop!)&.employees }
  end

  def self.exclude_mentors_for_employee(employee_id)
    employee_id.blank? ? all : where.not(id: EmployeeMentor.where(employee_id: employee_id).map(&:mentor_id).uniq)
  end

  def self.role_obj(name)
    Role.find_by(name: name)
  end

  def is_admin?
    has_role?(:admin)
  end

  def is_inv_manager?
    has_role?(:inv_manager)
  end

  def is_mentor?
    has_role?(:mentor)
  end

  def send_reset_password_mail
    rand_str = 5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("")
    update!(temp_password: "#{rand_str}".gsub(/\s+/, ""))

    SendResetPasswordLinkMailer.with(employee: self).reset_password_mail.deliver_now
  end

  def transfer_to_colleague(product, receiver_employee, quantity)
    receiver_prompt = receiver_employee.inventory_prompts.create(product: product)
    receiver_prompt.update(assigned_by: self.name, quantity: (receiver_prompt.quantity.to_f + quantity.to_f))

    current_inventory = self.employees_inventories.where(product: product).first
    current_inventory.quantity -= quantity.to_f
    current_inventory.save!
  end

  def return_inventory
    employees_inventories.each do |emp_inventory|
      inventory = Inventory.find_or_create_by(product: emp_inventory.product)
      inventory.quantity += emp_inventory.quantity.to_f

      inventory.save!
    end
  end

  def update_reference
    str = 5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("").gsub(/\s+/, "")
    self.update(reference_number: str)
  end

  def verify_employees_mentors
    overall_percentage = self.service_percentage.to_f

    self.employees_mentors.each do |employee_mentor|
      mentor = employee_mentor.mentor
      if mentor.nil? || !mentor.is_mentor?
        self.errors.add(:mentor, "#{mentor.name} is not a mentor")
      else
        overall_percentage += employee_mentor.mentor_percentage.to_f
      end
    end

    if (overall_percentage > 100)
      self.errors.add(:service_percentage, "Overall assigned percentage exceeded. (service_percentage + mentors percentage = #{overall_percentage})")
    end
  end

  # Add role to the employee
  def update_employee_roles
    return unless ActiveRecord::Base.connection.table_exists? :roles

    add_roles = []
    remove_roles = []

    ROLES.each do |role|
      if self.send("is_#{role}")
        add_roles << role
      else
        remove_roles << role
      end
    end

    add_roles.each { |role| self.add_role role } if !add_roles.empty?
    remove_roles.each { |role| self.remove_role role } unless remove_roles.empty?
  end
end

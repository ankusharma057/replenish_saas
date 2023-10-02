class Employee < ApplicationRecord
  validates_uniqueness_of :name
  validates_uniqueness_of :email, case_sensitive: false

  has_many :invoices
  has_many :products
  has_many :clients
  has_many :inventory_prompts, class_name: 'InventoryPrompt', dependent: :destroy
  has_many :inventory_requests, class_name: 'InventoryRequest', foreign_key: :requestor_id, dependent: :destroy
  has_many :employees_inventories, class_name: 'EmployeeInventory', dependent: :destroy

  before_destroy :return_inventory

  has_secure_password

  %i[admins inv_managers].each do |role|
    scope role.to_sym, -> { where(("is_"+role.to_s.chop!).to_sym => true) }
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
end

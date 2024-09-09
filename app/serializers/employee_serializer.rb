class EmployeeSerializer < ActiveModel::Serializer
  attributes :id, :name, :vendor_name, :email

  # has_many :invoices
  # has_many :inventory_prompts, class_name: 'InventoryPrompt'
  # has_many :inventory_requests, class_name: 'InventoryRequest', foreign_key: :requestor_id
  # has_many :employees_inventories, class_name: 'EmployeeInventory'
  # has_many :employee_mentors, class_name: 'EmployeeMentor'
  # has_many :employee_locations, class_name: 'EmployeeLocation'

  # def employees_inventories
  #   object.employees_inventories&.map do |employee_inventory|
  #     EmployeeInventorySerializer.new(employee_inventory).attributes
  #   end
  # end

  # def inventory_prompts
  #   object.inventory_prompts&.map do |inventory_prompt|
  #     InventoryPromptSerializer.new(inventory_prompt).attributes
  #   end
  # end

  def roles
    object.roles
  end

  def pending_requests
    object.inventory_requests.where.not(is_approved: true) 
  end

  def is_admin
    object.is_admin?
  end

  def is_inv_manager
    object.is_inv_manager?
  end

  def is_mentor
    object.is_mentor?
  end
end

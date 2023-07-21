class EmployeeSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :password, :is_admin, :is_inv_manager, :gfe, :service_percentage, :retail_percentage, :inventory_prompts, :employees_inventories

  has_many :invoices
  has_many :inventory_prompts, class_name: 'InventoryPrompt'
  has_many :inventory_requests, class_name: 'InventoryRequest', foreign_key: :requestor_id
  has_many :employees_inventories, class_name: 'EmployeeInventory'

  def employees_inventories
    object.employees_inventories&.map do |employee_inventory|
      EmployeeInventorySerializer.new(employee_inventory).attributes
    end
  end

  def inventory_prompts
    object.inventory_prompts&.map do |inventory_prompt|
      InventoryPromptSerializer.new(inventory_prompt).attributes
    end
  end
end

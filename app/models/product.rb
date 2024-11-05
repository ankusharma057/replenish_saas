class Product < ApplicationRecord
  validates_uniqueness_of :name  
  has_many :products_invoices, class_name: 'ProductInvoice'
  has_many :invoices, through: :products_invoices
  has_one  :inventory, class_name: 'Inventory', dependent: :destroy
  has_many :inventory_prompts, class_name: 'InventoryPrompt', dependent: :destroy
  has_many :employees_inventories, class_name: 'EmployeeInventory', dependent: :destroy
  has_many :schedule_products, dependent: :destroy
  has_many :schedules, through: :schedule_products
  has_many :treatments

  def create_or_update_inventory(quantity: nil)
    inventory.nil? ? create_inventory(quantity: quantity.to_f) : 
      inventory.update!(quantity: (inventory.quantity.to_f + quantity.to_f))
  end

  def self.with_associations_for_employee(employee_id)
    if employee_id.present?
      joins(:treatments)
        .includes(treatments: :employee, invoices: [], inventory_prompts: [])
        .where(id: Employee.find_by_id(employee_id).employees_inventories.pluck(:product_id))
    else
      includes(treatments: :employee, invoices: [], inventory_prompts: [])
    end
  end
end

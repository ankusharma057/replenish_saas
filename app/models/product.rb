class Product < ApplicationRecord
  validates_uniqueness_of :name  
  has_many :products_invoices, class_name: 'ProductInvoice'
  has_many :invoices, through: :products_invoices
  has_one  :inventory, class_name: 'Inventory', dependent: :destroy
  has_many :inventory_prompts, class_name: 'InventoryPrompt', dependent: :destroy
  has_many :employees_inventories, class_name: 'EmployeeInventory', dependent: :destroy

  def create_or_update_inventory(quantity: nil)
    inventory.nil? ? create_inventory(quantity: quantity.to_i) : 
      inventory.update!(quantity: (inventory.quantity.to_i + quantity.to_i))
  end
end

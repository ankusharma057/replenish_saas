class AddVendorNameToEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :vendor_name, :employees, :string
  end
end

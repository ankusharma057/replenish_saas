class AddVendorNameToEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :vendor_name, :string
  end
end

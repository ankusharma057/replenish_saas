class AddFieldsToClientDetail < ActiveRecord::Migration[7.0]
  def change
    add_column :client_details, :home_phone, :string
    add_column :client_details, :mobile_phone, :string
    add_column :client_details, :work_phone, :string
    add_column :client_details, :fax_phone, :string
    add_column :client_details, :sex, :string
  end
end
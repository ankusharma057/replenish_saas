class AddColumnsIntoClients < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :email, :string
    add_column :clients, :temp_password, :string
  end
end

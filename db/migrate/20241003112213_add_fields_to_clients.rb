class AddFieldsToClients < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :last_name, :string
    add_column :clients, :preferred_name, :string
    add_column :clients, :pronouns, :string
    add_column :clients, :prefix, :string
    add_column :clients, :middle_name, :string
  end
end

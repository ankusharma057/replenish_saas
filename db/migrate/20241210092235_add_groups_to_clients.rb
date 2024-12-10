class AddGroupsToClients < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :groups, :jsonb
  end
end

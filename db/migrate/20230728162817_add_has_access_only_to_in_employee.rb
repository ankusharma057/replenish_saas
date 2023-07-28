class AddHasAccessOnlyToInEmployee < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :has_access_only_to, :string, default: 'all'
  end
end

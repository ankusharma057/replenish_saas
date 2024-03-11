class AddTimezoneIntoClient < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :timezone, :string, default: "UTC"
  end
end

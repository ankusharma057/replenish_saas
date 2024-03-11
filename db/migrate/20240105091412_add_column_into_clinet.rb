class AddColumnIntoClinet < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :stripe_id, :string
  end
end

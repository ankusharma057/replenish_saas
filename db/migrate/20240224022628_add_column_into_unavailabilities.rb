class AddColumnIntoUnavailabilities < ActiveRecord::Migration[7.0]
  def change
    add_column :unavailabilities, :every_week, :boolean, default: false
  end
end

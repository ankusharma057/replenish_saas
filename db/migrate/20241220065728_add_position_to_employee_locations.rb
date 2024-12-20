class AddPositionToEmployeeLocations < ActiveRecord::Migration[7.0]
  def change
    add_column :employee_locations, :position, :integer
  end
end

class AddWellnessPercentageToEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :wellness_percentage, :integer, default: 0
  end
end

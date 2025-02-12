class AddInstantPayToEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :instant_pay, :boolean
  end
end

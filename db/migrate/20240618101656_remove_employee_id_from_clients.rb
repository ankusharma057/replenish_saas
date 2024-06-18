class RemoveEmployeeIdFromClients < ActiveRecord::Migration[7.0]
  def change
    remove_column :clients, :employee_id
  end
end

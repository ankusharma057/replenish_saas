class RemoveColumnsFromEmployees < ActiveRecord::Migration[7.0]
   def up
     Employee.find_each do |employee|
       employee.add_role(:admin) if employee.attributes["is_admin"]
      employee.add_role(:inv_manager) if employee.attributes["is_inv_manager"]
    end
  
     remove_column :employees, :is_admin, :boolean
     remove_column :employees, :is_inv_manager, :boolean
   end

   def down
     add_column :employees, :is_admin, :boolean, default: false
     add_column :employees, :is_inv_manager, :boolean, default: false

     Employee.find_each do |employee|
       employee_param = {}
       employee_param[:is_admin] = true if employee.has_role?(:admin)
       employee_param[:is_inv_manager] = true if employee.has_role?(:inv_manager)
       employee.update(employee_param)
     end
   end
end

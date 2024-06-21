class RenameEmployeesMentorsToEmployeeMentors < ActiveRecord::Migration[7.0]
  def change
    rename_table :employees_mentors, :employee_mentors
  end
end

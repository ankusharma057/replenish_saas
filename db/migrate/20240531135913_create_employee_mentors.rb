class CreateEmployeeMentors < ActiveRecord::Migration[7.0]  
  def change
    create_table :employees_mentors do |t|
      t.integer "employee_id"
      t.integer "mentor_id"
      t.integer "mentor_percentage", default: 0, null: false

      t.timestamps
    end
  end
end

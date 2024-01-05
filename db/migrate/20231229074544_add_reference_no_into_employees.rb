class AddReferenceNoIntoEmployees < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :reference_number, :string, unique: true, index: true
  end
end

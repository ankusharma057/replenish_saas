class UpdateAllEmployeesPlanToFree < ActiveRecord::Migration[7.0]
  def change
    Employee.update_all(plan: 'free')
  end
end

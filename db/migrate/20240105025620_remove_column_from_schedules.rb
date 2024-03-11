class RemoveColumnFromSchedules < ActiveRecord::Migration[7.0]
  def change
    remove_column :schedules, :treatment, :string
  end
end

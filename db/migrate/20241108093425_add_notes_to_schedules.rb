class AddNotesToSchedules < ActiveRecord::Migration[7.0]
  def change
    add_column :schedules, :notes, :jsonb
  end
end

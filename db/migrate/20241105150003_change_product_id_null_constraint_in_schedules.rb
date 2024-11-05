class ChangeProductIdNullConstraintInSchedules < ActiveRecord::Migration[7.0]
  def change
    change_column_null :schedules, :product_id, true
  end
end

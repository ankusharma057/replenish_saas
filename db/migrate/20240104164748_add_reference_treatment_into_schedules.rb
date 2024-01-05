class AddReferenceTreatmentIntoSchedules < ActiveRecord::Migration[7.0]
  def change
    add_reference :schedules, :treatment, foreign_key: true, index: true
  end
end

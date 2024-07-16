class CreateTreatmentIntakeForms < ActiveRecord::Migration[7.0]
  def change
    create_table :treatment_intake_forms do |t|
      t.references :treatment, null: false, foreign_key: true
      t.references :intake_form, null: false, foreign_key: true

      t.timestamps
    end
  end
end

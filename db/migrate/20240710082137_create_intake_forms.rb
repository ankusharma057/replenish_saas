class CreateIntakeForms < ActiveRecord::Migration[7.0]
  def change
    create_table :intake_forms do |t|
      t.string :name
      t.integer :prompt_type
      t.date :effective_date
      t.string :valid_for
      t.text :introduction
      t.jsonb :form_data
      t.integer :appointment_type
      t.references :employee, null: false, foreign_key: true
      t.boolean :deleted, default: false

      t.timestamps
    end
  end
end

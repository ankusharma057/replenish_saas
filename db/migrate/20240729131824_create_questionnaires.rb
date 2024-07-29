class CreateQuestionnaires < ActiveRecord::Migration[7.0]
  def change
    create_table :questionnaires do |t|
      t.string :name
      t.jsonb :template
      t.references :employee, null: false, foreign_key: true

      t.timestamps
    end
  end
end

class CreateResponseIntakeForms < ActiveRecord::Migration[7.0]
  def change
    create_table :response_intake_forms do |t|
      t.integer :intake_form_id, null: false, foreign_key: true
      t.integer :client_id, null: false, foreign_key: true
      t.jsonb :response_form_data

      t.timestamps
    end
  end
end

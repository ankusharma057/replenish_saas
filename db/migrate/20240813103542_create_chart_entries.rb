class CreateChartEntries < ActiveRecord::Migration[7.0]
  def change
    create_table :chart_entries do |t|
      t.string :name
      t.jsonb :chart_histroy
      t.references :employee, null: false, foreign_key: true
      t.references :client, null: false, foreign_key: true

      t.timestamps
    end
  end
end

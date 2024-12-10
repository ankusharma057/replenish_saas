class CreateFileUploads < ActiveRecord::Migration[7.0]
  def change
    create_table :file_uploads do |t|
      t.references :client, null: false, foreign_key: true
      t.string :description

      t.timestamps
    end
  end
end

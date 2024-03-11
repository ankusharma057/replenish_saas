class CreatePayments < ActiveRecord::Migration[7.0]
  def change
    create_table :payments do |t|
      t.string :session_id
      t.string :status
      t.references :client
      t.references :schedule

      t.timestamps
    end
  end
end

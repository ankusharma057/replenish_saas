class CreateClientDetails < ActiveRecord::Migration[7.0]
  def change
    create_table :client_details do |t|
      t.references :client, null: false, foreign_key: true
      t.string :city
      t.string :state
      t.string :zip_code
      t.string :country
      t.string :gender
      t.date :date_of_birth
      t.string :personal_health_number
      t.string :family_doctor
      t.string :family_doctor_phone
      t.string :family_doctor_email
      t.string :referring_professional
      t.string :referring_professional_phone
      t.string :referring_professional_email
      t.string :emergency_contact
      t.string :emergency_contact_phone
      t.string :emergency_contact_relationship
      t.string :parent_guardian
      t.string :occupation
      t.string :employer

      t.timestamps
    end
  end
end

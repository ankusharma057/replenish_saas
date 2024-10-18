class ClientDetailSerializer < ActiveModel::Serializer
  attributes :city, :state, :zip_code, :country, :gender, :date_of_birth, :personal_health_number, 
             :family_doctor, :family_doctor_phone, :family_doctor_email, 
             :referring_professional, :referring_professional_phone, 
             :referring_professional_email, :emergency_contact, :emergency_contact_phone, 
             :emergency_contact_relationship, :parent_guardian, :occupation, :employer, :home_phone, :mobile_phone, :work_phone, :fax_phone, :sex

end

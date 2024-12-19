class LocationSerializer < ActiveModel::Serializer
  attributes :id, :name, :short_description, :long_description, :email, :phone_number, :fax, :street_address, :apartment, :city, :country, :province, :postal_code, :display_location_address, :display_map_in_emails, :legal_name, :business_number, :use_location_for_billing, :online_booking_available, :employees
end

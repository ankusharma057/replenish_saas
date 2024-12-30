namespace :import do
  desc "Import or update location data"
  task locations: :environment do
    require 'json'

    file_path = Rails.root.join('db', 'data', 'activeLocations.json')
    unless File.exist?(file_path)
      puts "File not found: #{file_path}"
      exit
    end

    data = JSON.parse(File.read(file_path))
    data.each do |location_data|
      location = Location.find_or_initialize_by(name: location_data['name'])
      location.short_description = location_data['short_description']
      location.long_description = location_data['long_description']
      location.email = location_data['email']
      location.phone_number = location_data['phone_number']
      location.fax = location_data['fax']
      location.street_address = location_data['street_address']
      location.apartment = location_data['apartment']
      location.city = location_data['city']
      location.country = location_data['country']
      location.province = location_data['province']
      location.postal_code = location_data['postal_code']
      location.display_location_address = location_data['display_location_address']
      location.display_map_in_emails = location_data['display_map_in_emails']
      location.legal_name = location_data['legal_name']
      location.business_number = location_data['business_number']
      location.use_location_for_billing = location_data['use_location_for_billing']
      location.online_booking_available = location_data['online_booking_available']

      if location.save
        puts location.new_record? ? "Created new location: #{location.name}" : "Updated location: #{location.name}"
      else
        puts "Failed to save location: #{location_data['name']}. Errors: #{location.errors.full_messages.join(', ')}"
      end
    end
  end
end

class AddDetailsToLocations < ActiveRecord::Migration[7.0]
  def change
    add_column :locations, :short_description, :string
    add_column :locations, :long_description, :text
    add_column :locations, :email, :string
    add_column :locations, :phone_number, :string
    add_column :locations, :fax, :string
    add_column :locations, :street_address, :string
    add_column :locations, :apartment, :string
    add_column :locations, :city, :string
    add_column :locations, :country, :string
    add_column :locations, :province, :string
    add_column :locations, :postal_code, :string
    add_column :locations, :display_location_address, :boolean, default: false
    add_column :locations, :display_map_in_emails, :boolean, default: false
    add_column :locations, :legal_name, :string
    add_column :locations, :business_number, :string
    add_column :locations, :use_location_for_billing, :boolean, default: false
    add_column :locations, :online_booking_available, :boolean, default: false
  end
end

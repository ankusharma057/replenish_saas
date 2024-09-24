class AddAddressAndPhoneNumberToClients < ActiveRecord::Migration[7.0]
  def change
    add_column :clients, :address, :string
    add_column :clients, :phone_number, :string
  end
end

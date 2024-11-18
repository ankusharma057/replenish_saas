class AddLocationToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_reference :invoices, :location, foreign_key: true
  end
end

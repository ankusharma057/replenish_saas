class AddSemagConsultFeeInInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :semag_consult_fee, :boolean, default: false
  end
end

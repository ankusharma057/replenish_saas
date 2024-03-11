class AddColumnAmountIntoPayment < ActiveRecord::Migration[7.0]
  def change
    add_column :payments, :amount, :string
  end
end

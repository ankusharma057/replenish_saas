class AddPay50ColumnToEmployee < ActiveRecord::Migration[7.0]
  def change
    add_column :employees, :pay_50, :boolean, :default => false
  end
end

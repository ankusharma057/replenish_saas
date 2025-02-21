class ChangeEmployeeIdToBeIntegerInInvoices < ActiveRecord::Migration[7.0]
  def change
    change_column :invoices, :employee_id, 'integer USING CAST(employee_id AS integer)'
  end
end

class AddEvaluationFieldsToInvoices < ActiveRecord::Migration[7.0]
  def change
    add_column :invoices, :service_experience, :boolean, default: false
    add_column :invoices, :comfort_with_modality, :boolean, default: false
    add_column :invoices, :mentor_value_provided, :boolean, default: false
    add_column :invoices, :service_experience_reason, :text, default: ""
    add_column :invoices, :comfort_with_modality_reason, :text, default: ""
    add_column :invoices, :mentor_value_provided_reason, :text, default: ""
    add_column :invoices, :mentor_id, :integer
  end
end

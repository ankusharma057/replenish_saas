class InvoiceSerializer < ActiveModel::Serializer
  attributes :id, :employee_id, :client_id, :charge, :is_finalized, :date_of_service, :paid_by_client_cash, :paid_by_client_credit, :comments, :personal_discount, :tip, :concierge_fee_paid, :gfe, :overhead_fee_type, :overhead_fee_value, :products_hash

  belongs_to :employee
  belongs_to :client
  has_many :products

  attribute :client_name do
    object.client&.name
  end

  attribute :employee_name do
    object.employee&.name
  end

  attribute :fellow_invoices do
    if object.invoice_group
      object.fellow_invoices&.ids
    end
  end
end

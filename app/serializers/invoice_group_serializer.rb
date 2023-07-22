class InvoiceGroupSerializer < ActiveModel::Serializer
  attributes :id, :finalized_totally

  has_many :invoices
end

class InvoiceSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  attributes :id, :employee_id, :client_id, :charge, :is_finalized, :date_of_service, :paid_by_client_cash, :paid_by_client_credit, :comments, :personal_discount, :tip, :concierge_fee_paid, :gfe, :overhead_fee_type, :overhead_fee_value, :products_hash, :source_invoice_id

  attribute :before_images do
    object.before_images.map{|image| rails_blob_path(image, only_path: true)}
  end

  attribute :after_images do
    object.after_images.map{|image| rails_blob_path(image, only_path: true)}
  end

  belongs_to :employee
  belongs_to :client
  has_many :products

  attribute :client_name do
    object.client&.name
  end

  attribute :employee_name do
    object.employee&.name
  end

  attribute :fellow_non_finalized_invoices do
    if object.invoice_group
      object.fellow_invoices.where(is_finalized: false)&.ids
    end
  end
end

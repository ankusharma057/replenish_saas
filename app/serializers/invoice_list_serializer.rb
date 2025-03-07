# frozen_string_literal: true

class InvoiceListSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers
  attributes :id, :employee_id, :client_id, :charge, :is_finalized, :date_of_service,
             :paid_by_client_cash, :paid_by_client_credit, :amt_paid_for_products, :payment_type,
             :amt_paid_for_retail_products, :amt_paid_for_wellness_products, :comments, :personal_discount,
             :tip, :concierge_fee_paid, :gfe, :provider_purchased, :overhead_fee_type, :overhead_fee_value,
             :products_hash, :source_invoice_id, :employee, :client, :location, :is_paid, :stripe_account_id,
             :created_at, :instant_pay, :payment_status

  attribute :before_images do
    object.before_images.map { |image| rails_blob_path(image, only_path: true) }
  end

  attribute :after_images do
    object.after_images.map { |image| rails_blob_path(image, only_path: true) }
  end

  def employee
    employee = object.employee
    return unless employee

    {
      id: employee.id,
      name: employee.name,
      vendor_name: employee.vendor_name,
      email: employee.email,
      gfe: employee.gfe,
      service_percentage: employee.service_percentage,
      retail_percentage: employee.retail_percentage,
      pay_50: employee.pay_50,
      is_admin: employee.is_admin?,
      is_inv_manager: employee.is_inv_manager?,
      is_mentor: employee.is_mentor?
    }
  end

  def client
    client = object.client
    return unless client

    {
      id: client.id,
      name: client.name,
      last_name: client.last_name
    }
  end

  def location
    {
      name: object.location&.name
    }
  end

  has_many :products

  attribute :client_name do
    object.client&.name
  end

  attribute :employee_name do
    object.employee&.name
  end

  attribute :fellow_non_finalized_invoices do
    object.invoice_group&.invoices&.filter_map do |invoice|
      invoice.id if !invoice.is_finalized && invoice.id != object.id
    end
  end
end

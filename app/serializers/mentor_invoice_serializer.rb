# frozen_string_literal: true

# app/serializers/mentor_invoice_serializer.rb
class MentorInvoiceSerializer < ActiveModel::Serializer
  attributes :id, :charge, :date_of_service, :paid_by_client_cash, :paid_by_client_credit, :amt_paid_for_mp_products, :comments,
             :concierge_fee_paid, :gfe, :products_hash, :service_experience, :comfort_with_modality, :payment_type,
             :mentor_value_provided, :comfort_with_modality_reason, :service_experience_reason, :mentor_value_provided_reason

  belongs_to :employee
  belongs_to :client
  belongs_to :mentor, class_name: 'Employee'

  class EmployeeSerializer < ActiveModel::Serializer
    attributes :id, :name, :email
  end

  class ClientSerializer < ActiveModel::Serializer
    attributes :id, :name, :email
  end
end

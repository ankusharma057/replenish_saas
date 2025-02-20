# spec/factories/invoices.rb
FactoryBot.define do
  factory :invoice do
    is_finalized { true }
    location
    employee
    client  # Ensure the association is defined in the factory
    invoice_group  # Ensure this association is defined in the factory
    paid_by_client_cash { 0 }
    paid_by_client_credit { 0 }
    total_consumable_cost { 0 }
    tip { 0 }
    personal_discount { 0 }
  end
end

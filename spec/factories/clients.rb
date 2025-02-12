FactoryBot.define do
  factory :client do
    sequence(:email) { |n| "clientdsa#{n}@example.com" }
    sequence(:name) { |n| "Client Name #{n}" }
    last_name { "Doea" }
  end
end
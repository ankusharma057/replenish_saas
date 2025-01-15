# app/services/stripe/session.rb
module Stripe
  class Session
    def self.create_payment_intent(amount:, currency:, payment_method_types:)
      Stripe::PaymentIntent.create({
        amount: amount,
        currency: currency,
        payment_method_types: payment_method_types
      })
    end

    def self.create_checkout_session(customer:, line_items:, return_url:, products:, treatments:)
      Stripe::Checkout::Session.create(customer: customer, mode: 'payment', ui_mode: 'embedded', line_items: line_items, return_url: return_url, metadata: {
        treatments: treatments.to_json,
        products: products.to_json
      })
    end

    def self.create_save_card_checkout_session(customer_id:, return_url:)
      Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        currency: 'usd',
        mode: 'setup',
        ui_mode: 'embedded',
        return_url: return_url,
        setup_intent_data: { metadata: { customer_id: customer_id } }
      )
    end

    def self.retrieve_checkout_session(session_id)
      Stripe::Checkout::Session.retrieve(session_id)
    end

    def self.list_attached_cards(customer_id)
      Stripe::PaymentMethod.list(customer: customer_id, type: 'card')
    end

    def self.detach_payment_method(payment_method_id)
      Stripe::PaymentMethod.detach(payment_method_id)
    end

    def self.attach_payment_method(payment_method_id, customer_id)
      Stripe::PaymentMethod.attach(payment_method_id, { customer: customer_id })
    end
  end
end

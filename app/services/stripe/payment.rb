module Stripe
  class Payment
    def self.create(schedule, amount=50)
      Stripe::Payment.new(schedule, amount).get_session_url
    end

    def initialize(schedule, amount)
      @schedule = schedule
      @client = schedule.client
      @amount = amount
    end

    def get_session_url
      stripe_customer_id = @client.stripe_id || create_stripe_customer
      success_url = 'http://localhost:4000/stripe-onboard-success'
      cancel_url = "http://localhost:4000/clients/appointments"
      session = Stripe::Checkout::Session.create(
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: "#{@schedule.product.name}(#{@schedule.product.product_type})",
            },
            unit_amount: (@amount * 100), # multiply with 100 to convert into Doller
          },
          quantity: 1,
        }],
        customer: stripe_customer_id,
        mode: 'payment',
        success_url: success_url,
        cancel_url: cancel_url,
      )
    end

    def create_stripe_customer
      stripe_customer = Stripe::Customer.create({
        email: @client.email,
        name: @client.name,
        phone: '9696562201',
        address: {
          line1: '510 Townsend St',
          city: 'San Francisco',
          state: 'CA',
          postal_code: '98140',
          country: 'US'
        },
        metadata: {
          user_id: @client.id
        }
      })

      @client.update(stripe_id: stripe_customer.id)
      stripe_customer.id
    end
  end
end

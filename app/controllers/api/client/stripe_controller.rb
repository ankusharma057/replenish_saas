class Api::Client::StripeController < ClientApplicationController
  skip_before_action :authorized_client
  before_action :set_customer_id, only: [:list_attached_cards, :create_save_card_checkout_session]

  def success
    update_payment(params[:data][:object])

    head :ok
  end

  def create
    amount = params[:price].to_i
    currency = params[:currency]
    payment_method_types = [params[:type]]
    payment_intent = Stripe::PaymentIntent.create({
      amount: amount,
      currency: currency,
      payment_method_types: payment_method_types
    })
    render json: { clientSecret: payment_intent.client_secret }, status: :ok

  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def create_checkout_session
    line_items = build_line_items(params[:appointment_id], params[:amount])
    session = Stripe::Checkout::Session.create(
      customer: params[:stripe_id],
      mode: 'payment',
      ui_mode: 'embedded',
      line_items: line_items,
      return_url: build_return_url(params[:client_id], params[:appointment_id])
    )
    render json: { clientSecret: session.client_secret }
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def create_save_card_checkout_session
    session = Stripe::Checkout::Session.create(
      payment_method_types: ['card'],
      currency: 'usd',
      mode: 'setup',
      ui_mode: 'embedded',
      return_url: build_save_card_return_url(params[:client_id]),
      setup_intent_data: { metadata: { customer_id: @customer_id } }
    )
    render json: { clientSecret: session.client_secret }
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def session_status
    session = Stripe::Checkout::Session.retrieve(params[:session_id])
    render json: { status: session.status }
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def list_attached_cards
    payment_methods = Stripe::PaymentMethod.list(customer: @customer_id, type: 'card')
    render json: format_card_details(payment_methods.data), status: :ok
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def remove_card
    payment_method_id = params[:paymentMethodId]
    detach_payment_method(payment_method_id)
    render json: { message: "Credit card removed successfully." }, status: :ok
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def confirm_payment
    schedule = Schedule.find_by(id: params[:schedule_id])
    session = Stripe::Checkout::Session.retrieve(params[:session_id])

    if session.payment_status == 'paid'
      create_payment_record(schedule, session)
      render json: { status: 'success' }
    else
      render json: { status: 'failed' }, status: :unprocessable_entity
    end
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def card_success
    session_id = params[:session_id]
    begin
      session = Stripe::Checkout::Session.retrieve(session_id)
      
      setup_intent = Stripe::SetupIntent.retrieve(session.setup_intent)
      payment_method = Stripe::PaymentMethod.retrieve(setup_intent.payment_method)
  
      Stripe::PaymentMethod.attach(
        payment_method.id,
        { customer: setup_intent.metadata.customer_id }
      )
  
      render json: { message: "Payment method successfully attached to the customer." }, status: :ok
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  private

  def set_customer_id
    client = Client.find_by(id: params[:client_id])
    @customer_id = client&.stripe_id || create_stripe_customer(client)
  end

  def update_payment(session)
    payment = Payment.find_by(session_id: session[:id]) 
    payment.update(status: session[:payment_status]) if payment
  end

  def create_stripe_customer(client)
    stripe_customer = Stripe::Customer.create(
      email: client.email,
      name: client.name,
      phone: '9696562201',
      address: {
        line1: '510 Townsend St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '98140',
        country: 'US'
      },
      metadata: { user_id: client.id }
    )

    client.update(stripe_id: stripe_customer.id)
    stripe_customer.id
  end

  def render_error(exception)
    render json: { error: exception.message }, status: :unprocessable_entity
  end

  def build_line_items(appointment_id, price)
    [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: Schedule.find_by(id: appointment_id).treatment.name
        },
        unit_amount: price.to_i * 100 # Convert price to cents
      },
      quantity: 1
    }]
  end
  
  def build_return_url(client_id, appointment_id)
    "#{request.base_url}/customers/#{client_id}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&schedule_id=#{appointment_id}"
  end

  def build_save_card_return_url(client_id)
    "#{request.base_url}/customers/#{client_id}?session_id={CHECKOUT_SESSION_ID}"
  end

  def detach_payment_method(payment_method_id)
    Stripe::PaymentMethod.detach(payment_method_id)
  end

  def format_card_details(payment_methods)
    if payment_methods.empty?
      return { message: "No credit cards found for this customer." }
    end

    payment_methods.map do |pm|
      {
        id: pm.id,
        name: pm.billing_details.name,
        cardType: pm.card.brand,
        cardNumber: pm.card.last4,
        expiry: "#{pm.card.exp_month}/#{pm.card.exp_year}",
        dateAdded: Time.at(pm.created).strftime("%B %d, %Y"),
        paymentMethodId: pm.id
      }
    end
  end

  def create_payment_record(schedule, session)
    schedule.client.payments.create(
      session_id: session.id,
      status: "paid",
      schedule_id: schedule.id,
      amount: session.amount_total / 100,
    )
  end
end

class Api::Client::StripeController < ClientApplicationController
  skip_before_action :authorized_client
  before_action :set_customer_id, only: [:list_attached_cards, :create_save_card_checkout_session, :confirm_micro_deposit]

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
    session = Stripe::Session.create_checkout_session(customer: params[:stripe_id], line_items: line_items, return_url: build_return_url(params[:client_id], params[:appointment_id]))

    render json: { clientSecret: session.client_secret }
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def create_save_card_checkout_session
    session = Stripe::Session.create_save_card_checkout_session(customer_id: @customer_id, return_url: build_save_card_return_url(params[:client_id]))

    render json: { clientSecret: session.client_secret }
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def session_status
    session = Stripe::Session.retrieve_checkout_session(params[:session_id])

    render json: { status: session.status }
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def list_attached_cards
    payment_methods = Stripe::Session.list_attached_cards(@customer_id)

    render json: format_card_details(payment_methods.data), status: :ok
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def remove_card
    payment_method_id = params[:paymentMethodId]
    Stripe::Session.detach_payment_method(payment_method_id)
    
    render json: { message: "Credit card removed successfully." }, status: :ok
  rescue Stripe::StripeError => e
    render_error(e)
  end

  def confirm_payment
    schedule = Schedule.find_by(id: params[:schedule_id])
    session = Stripe::Session.retrieve_checkout_session(params[:session_id])

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
      session = Stripe::Session.retrieve_checkout_session(session_id)
      
      setup_intent = Stripe::SetupIntent.retrieve(session.setup_intent)
      payment_method = Stripe::PaymentMethod.retrieve(setup_intent.payment_method)
  
      Stripe::Session.attach_payment_method(payment_method.id, setup_intent.metadata.customer_id)
  
      render json: { message: "Payment method successfully attached to the customer." }, status: :ok
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def initiate_ach_account_verification
    payment_method_data = params.require(:payment_method_data).permit(
      us_bank_account: [:account_number, :routing_number, :account_holder_type],
      billing_details: [:name]
    )

    payment_method = Stripe::PaymentMethod.create(
      type: 'us_bank_account',
      us_bank_account: {
        account_number: payment_method_data[:us_bank_account][:account_number],
        routing_number: payment_method_data[:us_bank_account][:routing_number],
        account_holder_type: payment_method_data[:us_bank_account][:account_holder_type]
      },
      billing_details: {
        name: payment_method_data[:billing_details][:name]
      }
    )

    render json: { 
      payment_method_id: payment_method.id 
    }, status: :ok
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end


  def create_setup_intent
    payment_method_id = params[:payment_method_id]

    setup_intent = Stripe::SetupIntent.create(
      payment_method: payment_method_id,
      payment_method_types: ['us_bank_account']
    )

    render json: { 
      setup_intent_id: setup_intent.id 
    }, status: :ok
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def confirm_micro_deposit
    setup_intent_id = params[:setup_intent_id]
    deposit_amounts = params[:deposit_amounts]

    setup_intent = Stripe::SetupIntent.retrieve(setup_intent_id)
    if setup_intent.status == 'requires_confirmation'
      setup_intent = Stripe::SetupIntent.confirm(
        setup_intent.id,
        {
          payment_method: setup_intent.payment_method,
          mandate_data: { 
            customer_acceptance: {
              type: 'online',
              online: {
                ip_address: request.remote_ip,
                user_agent: request.user_agent
              }
            }
          }
        }
      )
    end
    verification = Stripe::SetupIntent.verify_microdeposits(
      setup_intent.id,
      { amounts: deposit_amounts }
    )
    if verification.status == 'succeeded'
      payment_method = Stripe::PaymentMethod.retrieve(id: setup_intent.payment_method)
      attach_customer = payment_method.attach(
        customer: @customer_id
      )
      render json: { message: 'Bank account verified successfully.' }, status: :ok
    else
      render json: { error: 'Verification failed. Please try again.' }, status: :unprocessable_entity
    end
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def finalize_invoice_payment
    original_amount = params[:price].to_i
    currency = params[:currency]
    payment_method_id = params[:payment_method_id]
    invoice_id = params[:invoice_id]

    stripe_fee = calculate_stripe_fee(original_amount)
    custom_fee = calculate_custom_fee(original_amount)
    total_amount = original_amount + stripe_fee + custom_fee

    begin
      payment_method = Stripe::PaymentMethod.retrieve(id: payment_method_id)

      payment_intent = Stripe::PaymentIntent.create(
        amount: total_amount,
        currency: currency,
        payment_method: payment_method_id,
        confirm: true,
        payment_method_types: ['us_bank_account'],
        customer: payment_method.customer,
        mandate_data: {
          customer_acceptance: {
            type: 'online',
            online: {
              ip_address: request.remote_ip,
              user_agent: request.user_agent
            }
          }
        },
        metadata: {
          original_amount: original_amount,
          stripe_fee: stripe_fee,
          Replenish: custom_fee
        }
      )
      if payment_intent.status == 'succeeded'
        update_invoice(invoice_id, payment_intent.id)
      end

      render json: {
        client_secret: payment_intent.client_secret,
        payment_intent_id: payment_intent.id,
        fees: { amount: total_amount, stripe_fee: stripe_fee, Replenish: custom_fee }
      }, status: :ok
    rescue Stripe::StripeError => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  def stripe_webhook
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    event = nil

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, ENV['STRIPE_WEBHOOK_SECRET']
      )
    rescue JSON::ParserError => e
      render json: { error: 'Invalid payload' }, status: 400 and return
    rescue Stripe::SignatureVerificationError => e
      render json: { error: 'Invalid signature' }, status: 400 and return
    end

    case event['type']
    when 'payment_intent.succeeded'
      payment_intent = event['data']['object']
      handle_payment_success(payment_intent)
    when 'payment_intent.payment_failed'
      payment_intent = event['data']['object']
      handle_payment_failure(payment_intent)
    end

    render json: { message: 'Webhook received' }, status: :ok
  end

  private

  def calculate_stripe_fee(amount)
    ((amount * 0.029 + 0.30)).round 
  end

  def calculate_custom_fee(amount)
    ((amount * 0.015) + 0.30).round
  end

  def handle_ach_payment_success(payment_intent)
    payment = Payment.find_by(session_id: payment_intent['id'])
    payment.update(status: 'paid') if payment
  end

  def handle_ach_payment_failure(payment_intent)
    Rails.logger.error("ACH Payment failed for intent: #{payment_intent['id']}")
  end

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

    client.update_attribute(:stripe_id, stripe_customer.id)
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
        unit_amount: price.to_i * 100
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

  def update_invoice(invoice_id, payment_intent_id)
    payment_intent = Stripe::PaymentIntent.retrieve(id: payment_intent_id)
    invoice = Invoice.find_by(id: invoice_id)
    if invoice
      invoice.update(
        is_paid: true,
        stripe_account_id: payment_intent.customer
      )
    else
      Rails.logger.error "Invoice not found for ID: #{invoice_id}"
    end
  end

end

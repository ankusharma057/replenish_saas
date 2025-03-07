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
    line_items = build_line_items(params[:selected_treatments], params[:selected_products])
    session = Stripe::Session.create_checkout_session(customer: params[:stripe_id], line_items: line_items, return_url: build_return_url(params[:client_id], params[:appointment_id]), products: params[:selected_products], treatments: params[:selected_treatments])

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

  def transfer_to_employee
    employee = Employee.find_by(id: params[:employee_id])
    invoice = Invoice.find(params[:invoice_id])

    if employee.stripe_account_id.nil?
      EmployeeMailer.onboard_to_stripe(employee).deliver_now
      render json: { error: 'This employee does not have a Stripe connect account.' }, status: :unprocessable_entity
      return
    end

    total_amount = (invoice.charge * 100).to_i
    account = Stripe::Account.retrieve(employee.stripe_account_id)
    if account.external_accounts.data.empty?
      EmployeeMailer.notify_missing_bank_account(employee).deliver_now
      render json: { error: 'This employee has not added a bank account to their Stripe account.' }, status: :unprocessable_entity
      return
    end
    if account.payouts_enabled && account.details_submitted
      if invoice.instant_pay
        begin
          transfer = Stripe::Transfer.create({
            amount: total_amount,
            currency: 'usd',
            destination: account.id,
            transfer_group: "ORDER_#{invoice.id}",
            metadata: { invoice_id: invoice.id }

          })
          
          EmployeeMailer.payment_initiated(employee, invoice).deliver_now
          render json: { message: 'Fast payment has been processed successfully!', transfer_id: transfer.id }, status: :ok
        rescue Stripe::StripeError => e
          render json: { message: 'Fast payment failed', error: e.message }, status: :unprocessable_entity
        end
      else
        schedule_payment(employee.id, invoice.id, total_amount)
        invoice.update(payment_status: "initiated")
        render json: { message: 'Payment initiated successfully' }, status: :ok
      end
    else
      EmployeeMailer.payment_failed(employee, invoice).deliver_now
      render json: { message: "Payout is not enabled for this account Emplopyee: #{employee.name}" }, status: :unprocessable_entity
    end    
  end


  def pay_multiple_invoice
    invoice_ids = params["_json"].pluck(:invoice_id)
    invoices = Invoice.includes(:employee).where(id: invoice_ids)
  
    response_messages = { success: [], errors: [] }
  
    invoices.each do |invoice|
      employee = invoice.employee
  
      if employee.stripe_account_id.nil?
        EmployeeMailer.onboard_to_stripe(employee).deliver_now
        response_messages[:errors] << {
          invoice_id: invoice.id,
          error: 'This employee does not have a Stripe Connect account.'
        }
        next
      end
  
      begin

        account = Stripe::Account.retrieve(employee.stripe_account_id)
  
        if account.external_accounts.data.empty?
          EmployeeMailer.notify_missing_bank_account(employee).deliver_now
          response_messages[:errors] << {
            invoice_id: invoice.id,
            error: 'This employee has not added a bank account to their Stripe account.'
          }
          next
        end
        if account.payouts_enabled && account.details_submitted
          if invoice.instant_pay
            begin
              total_amount = (invoice.charge * 100).to_i
              transfer = Stripe::Transfer.create({
                amount: total_amount,
                currency: 'usd',
                destination: account.id,
                transfer_group: "ORDER_#{invoice.id}",
                metadata: { invoice_id: invoice.id }
              })
  
              EmployeeMailer.payment_initiated(employee, invoice).deliver_now
              response_messages[:success] << {
                invoice_id: invoice.id,
                message: "Fast payment has been processed successfully! for Invoice ID: #{invoice.id}" ,
                transfer_id: transfer.id
              }
            rescue Stripe::StripeError => e
              response_messages[:errors] << {
                invoice_id: invoice.id,
                error: "Stripe transfer failed: #{e.message}"
              }
            end
          else
            schedule_payment(employee.id, invoice.id, invoice.charge.to_i)
            invoice.update!(payment_status: "initiated")
            response_messages[:success] << {
              invoice_id: invoice.id,
              message: 'Payment scheduled for later '
            }
          end
        else
          EmployeeMailer.payment_failed(employee, invoice).deliver_now
          response_messages[:errors] << {
            invoice_id: invoice.id,
            error: "Payout is not enabled or account details are incomplete for  Employee: #{employee.name}"
          }
        end
      rescue StandardError => e
        response_messages[:errors] << {
          invoice_id: invoice.id,
          error: "Processing error: #{e.message}"
        }
      end
    end
  
    render json: response_messages, status: :ok
  end
  

  def webhooks
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, endpoint_secret
      )
    rescue JSON::ParserError => e
      render json: { error: 'Invalid payload' }, status: :bad_request
      return
    rescue Stripe::SignatureVerificationError => e
      render json: { error: 'Invalid signature' }, status: :bad_request
      return
    end
    case event['type']      
    when 'transfer.created'
      transfer = event['data']['object']
      handle_successful_transfer(transfer)
    else
      render json: { message: 'Event type not handled' }, status: :ok
      return
    end

    render json: { message: 'Event received' }, status: :ok
  end

  private

  def schedule_payment(employee_id, invoice_id, total_amount)
    ScheduledPayment.create(
      employee_id: employee_id,
      invoice_id: invoice_id,
      total_amount: total_amount,
      scheduled_at: Time.current + 10.days
    )
    EmployeeMailer.scheduled_payment_notification(employee_id, invoice_id, total_amount).deliver_now
  end

  def handle_successful_transfer(transfer)
    invoice_id = transfer['metadata']['invoice_id']
    invoice = Invoice.find_by(id: invoice_id)

    if invoice
      invoice.update(is_paid: true, payment_status: "completed")
    end
  end

  def set_customer_id
    client = Client.find_by(id: params[:client_id])
    @customer_id = client&.stripe_id || create_stripe_customer(client, 'stripe_id')
  end

  def set_employee_customer_id
    employee = Employee.find_by(id: params[:employee_id])
    @customer_id = employee&.stripe_customer_id || create_stripe_customer(employee, 'stripe_customer_id')
  end

  def create_stripe_customer(record, stripe_id_field)
    stripe_customer = Stripe::Customer.create(
      email: record.email,
      name: record.name,
      phone: '9696562201',
      address: {
        line1: '510 Townsend St',
        city: 'San Francisco',
        state: 'CA',
        postal_code: '98140',
        country: 'US'
      },
      metadata: { user_id: record.id }
    )
    record.update_attribute(stripe_id_field, stripe_customer.id)
    stripe_customer.id
  end


  def update_payment(session)
    payment = Payment.find_by(session_id: session[:id]) 
    payment.update(status: session[:payment_status]) if payment
  end

  def render_error(exception)
    render json: { error: exception.message }, status: :unprocessable_entity
  end

  def build_line_items(selected_treatments, selected_products)
    line_items = []
    stripe_fee_percentage = 0.029
    stripe_fixed_fee = 0.30
    
    selected_treatments&.each do |treatment_id|
      treatment = Treatment.find(treatment_id)
      line_items << {
        price_data: {
          currency: 'usd',
          product_data: {
            name: treatment.name || 'Treatment'
          },
          unit_amount: (treatment.cost.to_f * 100).to_i
        },
        quantity: 1
      }
    end

    selected_products&.each do |prod|
      schedule_product = ScheduleProduct.find(prod[:schedule_product_id])
      product = schedule_product.product
      line_items << {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name || 'Product'
          },
          unit_amount: (product.retail_price.to_f * 100).to_i
        },
        quantity: prod[:quantity]
      }
    end

    total_amount = line_items.sum do |item|
      item[:price_data][:unit_amount] * item[:quantity]
    end / 100.0

    stripe_fee = (total_amount * stripe_fee_percentage + stripe_fixed_fee).round(2) * 2

    line_items << {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Stripe Fee'
        },
        unit_amount: (stripe_fee * 100).to_i
      },
      quantity: 1
    }

    line_items
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
    treatments = JSON.parse(session.metadata['treatments'] || '[]')
    products = JSON.parse(session.metadata['products'] || '[]')
    
    ActiveRecord::Base.transaction do
      treatments.each do |treatment_id|
        schedule.client.payments.create!(
          session_id: session.id,
          status: 'paid',
          schedule_id: schedule.id,
          schedule_treatment_id: schedule.schedule_treatments.find_by(treatment_id: treatment_id).id,
          amount: Treatment.find(treatment_id).cost.to_f
        )
      end
  
      products.each do |product_data|
        schedule_product = ScheduleProduct.find_by(id: product_data['schedule_product_id'])
        next unless schedule_product
  
        product = schedule_product.product
        schedule.client.payments.create!(
          session_id: session.id,
          status: 'paid',
          schedule_id: schedule.id,
          schedule_product_id: schedule_product.id,
          amount: product.retail_price.to_f * product_data['quantity'].to_i
        )
      end
    end
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

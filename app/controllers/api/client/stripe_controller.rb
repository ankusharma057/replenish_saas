class Api::Client::StripeController < ClientApplicationController
  skip_before_action :authorized_client

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

  private
  def update_payment(session)
    payment = Payment.find_by(session_id: session[:id]) 
    payment.update(status: session[:payment_status]) if payment
  end
end

class Api::Client::StripeController < ClientApplicationController
  skip_before_action :authorized_client

  def success
    update_payment(params[:data][:object])

    head :ok
  end

  private
  def update_payment(session)
    payment = Payment.find_by(session_id: session[:id]) 
    payment.update(status: session[:payment_status]) if payment
  end
end
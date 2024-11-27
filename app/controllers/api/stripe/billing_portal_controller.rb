class Api::Stripe::BillingPortalController < ApplicationController
  def create
    session = Stripe::BillingPortal::Session.create(
      customer: current_employee.stripe_customer_id,
      return_url: "#{request.base_url}/myprofile"
    )

    render json: { url: session.url }, status: :ok
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end

class Api::Stripe::CheckoutController < ApplicationController
  def pricing
    lookup_keys = %w[monthly yearly]
    @prices = Stripe::Price.list(lookup_keys: lookup_keys, active: true, expand: ['data.product']).data.sort_by(&:unit_amount)
    employee = current_employee.stripe_customer_id

    if employee
      active_subscription = Stripe::Subscription.list(customer: employee).data.first
      current_employee.update(plan: 'paid') if active_subscription && current_employee.plan == 'free'
      cancel_at_period_end = active_subscription&.cancel_at_period_end
      subscription_status = active_subscription&.status
      subscription_ends_at = active_subscription ? Time.at(active_subscription.current_period_end).to_datetime : nil
    else
      cancel_at_period_end = nil
      subscription_status = nil
      subscription_ends_at = nil
    end

    render json: { prices: @prices, subscription_status: subscription_status, subscription_ends_at: subscription_ends_at, cancel_at_period_end: cancel_at_period_end }
  end

  def checkout
    session = Stripe::Checkout::Session.create(
      customer: current_employee.stripe_customer_id,
      mode: 'subscription',
      line_items: [{
        quantity: 1,
        price: params[:price_id]
      }],
      success_url: "#{request.base_url}/myprofile",
      cancel_url: "#{request.base_url}/myprofile",
    )

    render json: { url: session.url }, status: :ok
  rescue Stripe::StripeError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
end

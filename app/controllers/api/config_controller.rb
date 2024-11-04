class Api::ConfigController < ApplicationController
  def index
    render json: { stripePublicKey: ENV["stripe_publishable_key"] }
  end
end

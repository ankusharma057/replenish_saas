class Api::Client::ProductsController < ClientApplicationController
  skip_before_action :authorized_client, only: [:index]

  def index
    products = Product.all
    render json: products, status: :ok
  end
end

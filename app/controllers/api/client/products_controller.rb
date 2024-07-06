class Api::Client::ProductsController < ClientApplicationController
  skip_before_action :authorized_client, only: [:index]

  def index
    products = params[:employee_id] ? Employee.find_by(params[:employee_id]).employees_inventories.map(&:product) : Product.all
    render json: products, status: :ok
  end
end

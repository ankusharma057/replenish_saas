# frozen_string_literal: true

class Api::ProductsController < ApplicationController
  skip_before_action :authorized_employee
  before_action :set_access_control_headers

  def index
    products = Employee.find_by(id: params[:employee_id])&.employees_inventories&.map(&:product) || Product.all
    render json: products, each_serializer: ProductSerializer, status: :ok
  end

  def show
    product = Product.find(params[:id])
    render json: product, status: :ok
  end

  def create
    product = Product.create!(product_params)
    render json: product, status: :created
  end

  def update
    product = Product.find(params[:id])
    product.update!(product_params)
    render json: product
  end

  def destroy
    product = Product.find(params[:id])
    product.destroy
    head :no_content
  end

  private

  def product_params
    params.require(:product).permit(:name, :product_type, :cost_price, :retail_price, :purchased_type)
  end

  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = 'http://localhost:4000'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, Token'
  end
end


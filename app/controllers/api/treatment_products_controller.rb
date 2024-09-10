class Api::TreatmentProductsController < ApplicationController

  def index
    @products = Product.all
    render json: @products, each_serializer: TreatmentProductSerializer, status: :ok
  end
end

# frozen_string_literal: true

class Api::InventoriesController < ApplicationController
  before_action :find_inventory, only: %i(update destroy assign)
  before_action :find_product, only: %i(create update)
  before_action :find_receiver_employee, only: :assign

  def index
    @inventories = Inventory.all
    render json: @inventories, status: :ok
  end

  def create
    create_or_update_inventory
  end

  def update
    if @product
      if @product.inventory.update(inventory_params)
        render json: @inventory, status: :ok
      else
        render json: { 'error' => "Could not Update the Inventory" }, status: :bad_request
      end
    else
      render json: { 'error' => 'Could not find the Product' }, status: :not_found
    end
  end

  def destroy
    if @inventory
      @inventory.destroy!
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  def assign
    if @inventory
      if @employee.is_admin
        inventory = @receiver_employee.employees_inventories.find_or_create_by(product: @inventory.product)
        inventory.update!(quantity: inventory.quantity.to_i + params[:inventory][:quantity].to_i)
      else
        @inventory.prompt_to_employee(@receiver_employee, params[:inventory][:quantity])
      end

      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  private

  def create_or_update_inventory
    if @product
      if @product.create_or_update_inventory(quantity: params[:quantity])
        render json: @inventory, status: :ok
      else
        render json: { 'error' => "Could not Create Inventory" }, status: :bad_request
      end
    else
      render json: { 'error' => 'Could not find the Product' }, status: :not_found
    end
  end

  def inventory_params
    params.require(:inventory).permit(:quantity)
  end

  def find_product
    @product = Product.find_by(name: params[:product_name])
  end

  def find_receiver_employee
    @receiver_employee = Employee.find_by(name: params[:employee_name])
  end

  def find_inventory
    @inventory = Inventory.find_by(id: params[:id])
  end
end

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
    if @product
      if @product.create_or_update_inventory(quantity: params[:quantity])
        text = "Inventory for #{@product.name.capitalize} has been created."
        send_message text
        render json: @inventory, status: :ok
      else
        render json: { 'error' => 'Could not Create Inventory' }, status: :bad_request
      end
    else
      render json: { 'error' => 'Could not find the Product' }, status: :not_found
    end
  end

  def update
    if @product
      if @product.inventory.update(inventory_params)
        text = "Quantity for the Inventory of #{@product.name.capitalize} has been updated to #{inventory_params[:quantity]}"
        send_message text
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
      text = "Inventory for #{@inventory.product.name.capitalize} has been deleted"
      @inventory.destroy!
      send_message text
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  def assign
    if @inventory
      if @employee.is_admin
        receiver_inventory = @receiver_employee.employees_inventories.find_or_create_by(product: @inventory.product)
        receiver_inventory.update!(quantity: receiver_inventory.quantity.to_f + params[:inventory][:quantity].to_f)
        @inventory.update!(quantity: @inventory.quantity.to_f - params[:inventory][:quantity].to_f)
      else
        @inventory.prompt_to_employee(@receiver_employee, params[:inventory][:quantity])
      end
        
      text = "#{@employee.name.capitalize} assigned #{params[:inventory][:quantity]} of #{@inventory.product.name} to #{@receiver_employee.name.capitalize}"
      send_message text

      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  private

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

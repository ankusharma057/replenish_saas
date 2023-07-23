class Api::InventoryRequestsController < ApplicationController
  before_action :find_inventory, only: :create
  before_action :find_inventory_request, except: :create

  def index
    @inventory_request = InventoryRequest.all
    render json: @inventory_request, status: :ok
  end

  def create
    if @inventory
      if @inventory.quantity.to_f < params[:quantity_asked].to_f
        render json: @inventory, status: 403
      else
        @inventory.request_for_inventory(current_employee, params[:quantity_asked], params[:date_of_use])
        render json: @inventory, status: :ok
      end
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  def accept
    if @inventory_request.accept!
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Error while accepting the prompt '} , status: :bad_request
    end
  end

  def reject
    if @inventory_request.destroy!
      render json: { 'success' => 'Request Removed Successfully!'} , status: :ok
    else
      render json: { 'error' => 'Error while destroying the prompt '} , status: :bad_request
    end
  end

  private

  def find_inventory
    @inventory = Inventory.find_by_id(params[:inventory][:id])
  end

  def find_inventory_request
    @inventory_request = InventoryRequest.find_by_id(params[:id])
  end
end

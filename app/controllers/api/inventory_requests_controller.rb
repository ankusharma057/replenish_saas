class Api::InventoryRequestsController < ApplicationController
  before_action :find_inventory, only: :create
  before_action :find_inventory_request, except: :create

  def index
    @inventory_request = InventoryRequest.unapproved
    render json: @inventory_request, status: :ok
  end

  def create
    if @inventory
      @inventory.request_for_inventory_and_send_mail(current_employee, params[:quantity_asked], params[:date_of_use])
      text = "#{current_employee.name.capitalize} has requested for #{params[:quantity_asked]} of #{@inventory.product.name.capitalize}. Date Needed: #{params[:date_of_use]}."
      send_message(send_to_inv_manager: true, text: text)
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  def accept
    if @inventory_request.accept!
      text = "#{current_employee.name.capitalize} has approved Inventory Request of #{@inventory_request.requestor.name.capitalize} for #{@inventory_request.quantity_asked} of #{@inventory_request.inventory&.product.name.capitalize}."
      send_message(text: text)
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Error while accepting the prompt '} , status: :bad_request
    end
  end

  def reject
    if @inventory_request.destroy!
      text = "#{current_employee.name.capitalize} has denied Inventory Request of #{@inventory_request.requestor.name.capitalize} for #{@inventory_request.quantity_asked} of #{@inventory_request.inventory&.product.name.capitalize}."
      send_message(text: text)
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

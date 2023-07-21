class Api::InventoryPromptsController < ApplicationController
  before_action :find_inventory, only: :create
  before_action :find_employee, only: :create
  before_action :find_inventory_prompt, except: :create

  def create
    if @inventory
      @inventory.prompt_to_employee(@receiver_employee, params[:quantity])
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Could not find Inventory' }, status: :bad_request
    end
  end

  def accept
    if @inventory_prompt.accept!
      render json: @inventory, status: :ok
    else
      render json: { 'error' => 'Error while accepting the prompt '} , status: :bad_request
    end
  end

  def reject
    if @inventory_prompt.reject!
      render json: { 'success' => 'Prompt Destroyed Successfully!'} , status: :ok
    else
      render json: { 'error' => 'Error while destroying the prompt '} , status: :bad_request
    end
  end

  private

  def find_inventory
    @inventory = Inventory.find_by_id params[:inventory_id]
  end

  def find_inventory_prompt
    @inventory_prompt = InventoryPrompt.find_by_id(params[:id])
  end

  def find_employee
    @receiver_employee = Employee.find_by(name: params[:employee_name])
  end
end

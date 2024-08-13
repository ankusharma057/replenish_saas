class Api::ChartEntriesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :set_chart_entry, only: %i[update destroy show]

  def index
    @chart_entries = ChartEntry.client_chart_entries(params)
    render json: @chart_entries
  end

  def create
    @chart_entry = ChartEntry.new(chart_entry_params)
    if @chart_entry.save
      render json: @chart_entry, status: :created
    else
      render json: {error: @chart_entry.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @chart_entry.update(chart_entry_params)
      render json: @chart_entry
    else
      render json: {error: @chart_entry.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    if @chart_entry.destroy
      render json: @chart_entry
    else
      render json: {error: @chart_entry.errors }, status: :unprocessable_entity
    end
  end

  def show
    render json: @chart_entry
  end

  private

  def set_chart_entry
    @chart_entry = ChartEntry.find_by(id: params[:id])
  end

  def chart_entry_params
    params.require(:chart_entries).permit(:id, :name, :employee_id, :client_id, chart_histroy: {})
  end
end

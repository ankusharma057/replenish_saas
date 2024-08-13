class ChartEntry < ApplicationRecord
  belongs_to :employee
  belongs_to :client

  def self.client_chart_entries(params)
    if params[:employee_id].present? && params[:client_id].present?
      where(employee_id: params[:employee_id], client_id: params[:client_id])
    else
      all
    end
  end
end

class ChartEntry < ApplicationRecord
  belongs_to :employee
  belongs_to :client

  validates :name, presence: true
  validates :chart_histroy, presence: true

  def self.client_chart_entries(params)
    entries = if params[:employee_id].present? && params[:client_id].present?
                includes(:employee, :client).where(employee_id: params[:employee_id], client_id: params[:client_id])
              else
                includes(:employee, :client)
              end
    entries.order(:created_at)
  end
end

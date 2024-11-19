class Api::InvoiceListsController < ApplicationController
  def index
    invoices = Invoice.where(mentor_id: nil).paginated_invoices(params)

    render json: {
      invoices: ActiveModelSerializers::SerializableResource.new(invoices, each_serializer: InvoiceListSerializer),
      current_page: invoices.current_page,
      total_pages: invoices.total_pages,
      total_entries: invoices.total_entries
    }, status: :ok
  end

  def employee_invoices
    if params[:employee_id].present?
      @employee = Employee.find_by(id: params[:employee_id])
      invoices = @employee.invoices.joins(:client).select('invoices.id, clients.name as client_name')
    else
      invoices = []
    end
    render json: invoices.map { |invoice| { id: invoice.id, client_name: invoice.client_name } }, status: :ok
  end

  def mentorship_invoices
    invoices = params[:is_admin] == "true" ? Invoice.where.not(mentor_id: nil) || [] : Invoice.where(employee_id: params[:employee_id]).where.not(mentor_id: nil)
  
    render json: invoices, each_serializer: MentorInvoiceSerializer, status: :ok
  end
end
# frozen_string_literal: true

class Api::InvoicesController < ApplicationController
  skip_before_action :authorized_employee
  # before_action :find_employee, only: :create
  before_action :find_invoice, only: %i(finalize update send_reject_mail download_attachment)

  def index
    invoices = Invoice.all
    render json: invoices, status: :ok
  end

  def show
    invoice = Invoice.find(params[:id])
    render json: invoice, status: :ok
  end

  # def create
  #   @clients = params[:clientName].each do |client|
  #     @employee.clients.find_or_create_by(name: client)
  #   end

  #   # @products = params[:products].pluck("name", "quantity", "retail_price")
  #   # @retail_products = params[:retail_products].pluck("name", "quantity", "retail_price")

  #   if @client
  #     @invoice = @client.invoices.new(invoice_params)
  #     if @invoice.save
  #       @invoice.save_pdf_and_send_mail(@products, @retail_products)
  #       render json: @invoices.last, status: :created
  #     else
  #       render json: {'error' => @invoice.errors}, status: :bad_request
  #     end
  #   else
  #     render json: {'error' => "Please provide a client."}, status: :not_found
  #   end
  # end

  def update
    if @invoice.update!(invoice_params)
      render json: @invoice, status: :ok
    else
      render json: { 'error' => 'Failed to Update Invoice' }, status: :bad_request
    end
  end

  def finalize
    if @invoice.update!(is_finalized: true)
      if @invoice.fellow_invoices_finalized?
        @invoice.send_group_pdf_mail
        return render json: @invoice, status: :ok
      else
        return render json: {'message' => "Finalize Invoices: #{@invoice.fellow_invoices.where(is_finalized: false).ids} to receive the mail"}, status: :unprocessable_entity
      end
    else
      return render json: {'error' => 'Invoice not found'}, status: :not_found
    end
  end

  def send_reject_mail
    @invoice.reject_and_send_mail(params[:feedback])
  end

  def download_attachment
    if @invoice.document.attached?
      path = ActiveStorage::Blob.service.path_for(@invoice.document.key)
      send_data File.open(path, 'rb').read, type: 'application/pdf', disposition: 'attachment', filename: 'Note.pdf'
    else
      return render json: {'error' => 'Invoice not found'}, status: :not_found
    end
  end

  private

  def invoice_params
    params.require(:invoice).permit(:employee_id, :client_id, :charge, :is_finalized, :created_at, :updated_at, :date_of_service, :paid_by_client_cash, :paid_by_client_credit, :comments, :personal_discount, :tip, :concierge_fee_paid, :gfe, :overhead_fee_type, :overhead_fee_value)
  end

  # def find_employee
  #   @employee = Employee.find_by(id: params[:employee_id])
  # end

  def find_invoice
    @invoice = Invoice.find_by(id: params[:id])
  end
end

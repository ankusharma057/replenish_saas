# frozen_string_literal: true

class InvoicesController < ApplicationController
  skip_before_action :authorized_employee
  before_action :initialize_objects, only: :create
  before_action :find_invoice, only: [:finalize, :update, :send_reject_mail]

  def index
    invoices = Invoice.all
    render json: invoices, status: :ok
  end

  def show
    invoice = Invoice.find(params[:id])
    render json: invoice, status: :ok
  end

  def create
    if @client
      @invoice = @client.invoices.new(invoice_params)
      if @invoice.save
        @invoice.save_pdf_and_send_mail(@products, @retail_products)
        render json: @invoice, status: :created
      else
        render json: {'error' => @invoice.errors}, status: :bad_request
      end
    else
      render json: {'error' => "Please provide a client."}, status: :not_found
    end
  end

  def update
    if @invoice.update!(invoice_params)
      render json: @invoice, status: :ok
    else
      render json: { 'error' => 'Failed to Update Invoice' }, status: :bad_request
    end
  end

  def finalize
    if @invoice
      @invoice.finalize_and_send_pdf_mail
      return render json: @invoice, status: :ok
    else
      return render json: {'error' => 'Invoice not found'}, status: :not_found
    end
  end

  def send_reject_mail
    @invoice.reject_and_send_mail(params[:feedback])
  end

  private

  def invoice_params
    params.require(:invoice).permit(:employee_id, :client_id, :charge, :is_finalized, :created_at, :updated_at, :date_of_service, :paid_by_client_cash, :paid_by_client_credit, :comments, :personal_discount, :tip, :concierge_fee_paid, :gfe, :overhead_fee_type, :overhead_fee_value)
  end

  def initialize_objects
    @employee = Employee.find_by(id: params[:employee_id])

    @client = if params[:client_name] && !params[:client_name].empty?
      @employee.clients.find_or_create_by(name: params[:client_name])
    end

    @products = params[:products].pluck("name", "quantity", "retail_price")
    @retail_products = params[:retail_products].pluck("name", "quantity", "retail_price")
  end

  def find_invoice
    @invoice = Invoice.find_by(id: params[:id])
  end
end

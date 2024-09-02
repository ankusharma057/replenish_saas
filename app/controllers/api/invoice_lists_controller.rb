class Api::InvoiceListsController < ApplicationController

  def index
    invoices = Invoice.all
    render json: invoices, each_serializer: InvoiceListSerializer, status: :ok
  end
end
class Api::InvoiceListsController < ApplicationController
  def index
    invoices = Invoice.includes(
      :products, 
      :employee, 
      :client, 
      :before_images_attachments, 
      :after_images_attachments, 
      :invoice_group
    ).all
    
    render json: invoices, each_serializer: InvoiceListSerializer, status: :ok
  end
end

class Api::InvoiceGroupsController < ApplicationController
  include InvoiceGroupConcern

  def create
    create_invoice_group
  end

  private

  def invoice_params
    params.require(:invoice).permit!
  end
end

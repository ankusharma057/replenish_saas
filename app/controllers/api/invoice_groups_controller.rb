class Api::InvoiceGroupsController < ApplicationController
  before_action :find_employee, only: :create

  def create
    @invoice_group = InvoiceGroup.create!
    if params['_json'].each do |invoice_param|
        client = @employee.clients.find_or_create_by(name: invoice_param['clientname'])
        invoice = Invoice.new(employee: @employee)

        Invoice.column_names.each do |attr|
          invoice[attr] = invoice_param[attr] unless attr.eql?('id')
        end

        invoice.invoice_group = @invoice_group
        invoice.client = client

        products = invoice_param['products']&.pluck("name", "quantity", "retail_price")
        retail_products = invoice_param['retail_products']&.pluck("name", "quantity", "retail_price")
        
        invoice.products_hash = {
          "products" => products,
          "retail_products" => retail_products
        }

        if invoice.products_hash && invoice.products_hash.any?
          invoice.products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
            emp_inventory = @employee.employees_inventories.where(product: Product.find_by(name: product_quantity.keys.first)).first
            emp_inventory&.update(quantity: (emp_inventory.quantity - product_quantity.values.first.to_f))
          end
        end

        invoice.is_finalized = false

        invoice.save!
      end

      @invoice_group.save_pdfs_and_send_mail

      render json: @invoice_group, status: :ok
    else
      render json: { 'error' => 'Something Went Wrong' }, status: :unprocessable_entity
    end
  end

  private

  def invoice_params
    params.permit!
  end

  def find_employee
    @employee = Employee.find_by(id: params['_json'].first['employee_id'])
  end
end

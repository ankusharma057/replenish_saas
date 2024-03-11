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

        products = invoice_param['products']&.pluck("name", "quantity", "cost_price")
        retail_products = invoice_param['retail_products']&.pluck("name", "quantity", "cost_price")
        
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

        id = invoice.id
        decoded_before_images_data = invoice_param['beforeImages'].map { |data| Base64.decode64(data.sub("data:image/png;base64,", '')) }

        decoded_before_images_data.each_with_index do |before_image, index|
          filename = "#{id}-before-image-#{index+1}.png"
          file_path = File.join(Rails.root+'public', filename)
          File.open(file_path, 'wb') { |file| file.write(before_image) }
          invoice.before_images.attach(io: File.open(file_path),filename: filename)
          File.delete(file_path) if File.exist?(file_path)
        end

        decoded_after_images_data = invoice_param['afterImages'].map { |data| Base64.decode64(data.sub("data:image/png;base64,", '')) }

        decoded_after_images_data.each_with_index do |after_image, index|
          filename = "#{id}-after-image-#{index+1}.png"
          file_path = File.join(Rails.root+'public', filename)
          File.open(file_path, 'wb') { |file| file.write(after_image) }
          invoice.after_images.attach(io: File.open(file_path),filename: filename)
          File.delete(file_path) if File.exist?(file_path)
        end
      end

      @invoice_group.save_pdfs_and_send_mail

      text = "An invoice group with Invoice IDs: #{@invoice_group.invoices.ids} has been recently created by #{@invoice_group.invoices.first.employee&.name.capitalize}"
      send_message(text: text)

      render json: @invoice_group, status: :created
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

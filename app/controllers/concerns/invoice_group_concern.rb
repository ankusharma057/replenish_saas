module InvoiceGroupConcern
  extend ActiveSupport::Concern

  MENTOR_INVOICE_EXCLUDE_COLUMNS = %w[employee_id paid_by_client_cash paid_by_client_credit comments personal_discount tip concierge_fee_paid gfe provider_purchased overhead_fee_type 
                                      overhead_fee_value semag_consult_fee  total_consumable_cos total_consumable_cost source_invoice_id notes instant_pay]

  included do
    before_action :find_employee, only: :create
  end

  def create_invoice_group
    @invoice_group = InvoiceGroup.create!
    params['_json'].each do |invoice_param|
      client = @employee.clients.find_by(name: invoice_param['clientname']) ||
         @employee.clients.create(
           name: invoice_param['clientname'],
           last_name: invoice_param['lastname'],
           email: invoice_param['email']
         )

      employee_invoice = create_invoice_for_employee(@employee, invoice_param, client)

      if @employee.mentors.any?
        @employee.mentors.each do |mentor|
          create_invoice_for_employee(mentor, invoice_param, client, employee_invoice.id, @employee)
        end
      end
    end
  
    @invoice_group.generate_pdfs_and_send_mails

    text = "An invoice group with Invoice IDs: #{@invoice_group.source_invoices.ids} has been recently created by #{@invoice_group.source_invoices.first.employee&.name}"
    send_message(text: text)
    render json: @invoice_group, status: :created
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
  

  private

  def find_employee
    @employee = Employee.find_by(id: params['_json'].first['employee_id'])
  end

  def create_invoice_for_employee(employee, invoice_param, client, source_invoice_id = nil, source_employee = nil)
    invoice = Invoice.new(employee: employee, source_invoice_id: source_invoice_id)
    invoice.location_id = invoice_param[:location_id] if invoice_param[:location_id].present?

    inventory_columns = source_invoice_id.blank? ? Invoice.column_names : (Invoice.column_names - MENTOR_INVOICE_EXCLUDE_COLUMNS)

    inventory_columns.each do |attr|
      unless attr.eql?('id')
        invoice[attr] = (attr != "charge") ? invoice_param[attr] : calculate_charge(source_employee, employee, invoice_param)
      end
    end

    invoice.invoice_group = @invoice_group
    invoice.client = client

    products = invoice_param['products']&.pluck("name", "quantity", "retail_price")
    retail_products = invoice_param['retail_products']&.pluck("name", "quantity", "retail_price")
    mp_products = invoice_param['mp_products']&.pluck("name", "quantity", "retail_price") || []

    invoice.products_hash = {
      "products" => products,
      "retail_products" => retail_products,
      "mp_products" => mp_products
    }

    if invoice.source_invoice_id.blank? && invoice.products_hash && invoice.products_hash.any?
      invoice.products_hash.values.flatten(1).map { |arr| { arr[0] => arr[1] } }.each do |product_quantity|
        emp_inventory = employee.employees_inventories.where(product: Product.find_by(name: product_quantity.keys.first)).first
        emp_inventory&.update(quantity: (emp_inventory.quantity - product_quantity.values.first.to_f))
      end
    end

    if invoice_param[:date_of_service].present?
      invoice.date_of_service = Date.strptime(invoice_param[:date_of_service], '%m-%d-%Y')
    end
    
    invoice.is_finalized = false
    invoice.is_paid ||= false
    invoice.save!

    attach_images(invoice, invoice_param) if invoice.source_invoice_id.blank?

    invoice
  end

  def calculate_charge(source_employee, mentor_or_employee, invoice_param)
    return invoice_param['charge'] if source_employee.blank?

    employee_mentor = EmployeeMentor.where(employee_id: source_employee.id, mentor_id: mentor_or_employee.id).select(:mentor_percentage).first
    mentor_percentage = employee_mentor.mentor_percentage.to_f
    client_cash = invoice_param['paid_by_client_cash'].to_f
    client_credit = invoice_param['paid_by_client_credit'].to_f
    mentor_price = (client_cash + (client_credit - (client_credit * 0.031)) - invoice_param[:total_consumable_cost]) * (mentor_percentage/100)
    mentor_price.round(2)
  end

  def attach_images(invoice, invoice_param)
    id = invoice.id

    decoded_before_images_data = invoice_param['beforeImages'].map { |data| Base64.decode64(data.sub("data:image/png;base64,", '')) }
    decoded_before_images_data.each_with_index do |before_image, index|
      filename = "#{id}-before-image-#{index + 1}.png"
      file_path = File.join(Rails.root + 'public', filename)
      File.open(file_path, 'wb') { |file| file.write(before_image) }
      invoice.before_images.attach(io: File.open(file_path), filename: filename)
      File.delete(file_path) if File.exist?(file_path)
    end

    decoded_after_images_data = invoice_param['afterImages'].map { |data| Base64.decode64(data.sub("data:image/png;base64,", '')) }
    decoded_after_images_data.each_with_index do |after_image, index|
      filename = "#{id}-after-image-#{index + 1}.png"
      file_path = File.join(Rails.root + 'public', filename)
      File.open(file_path, 'wb') { |file| file.write(after_image) }
      invoice.after_images.attach(io: File.open(file_path), filename: filename)
      File.delete(file_path) if File.exist?(file_path)
    end
  end
end

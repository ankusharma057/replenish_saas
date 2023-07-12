class Invoice < ApplicationRecord
  require 'prawn-html'

  belongs_to :employee
  belongs_to :client
  has_many :products_invoices, class_name: 'ProductInvoice'
  has_many :products, through: :products_invoices
  has_one_attached :document, dependent: :purge

  validates_presence_of :overhead_fee_type, on: :update, if: lambda{ |invoice| invoice.overhead_fee_value.present? }

  before_update :revise_charge
  before_destroy :return_inventory

  scope :finalized, -> { where(is_finalized: true) }
  scope :non_finalized, -> { where(is_finalized: false) }

  def save_pdf_and_send_mail(products, retail_products)
    # TODO: Refactor the duplicate code to generate the pdf in this and the later method (before the overhead section) 

    products_hash["products"] = products
    products_hash["retail_products"] = retail_products

    if products_hash && products_hash.any?
      products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
        emp_product_quantity = employee.employees_inventories.where(product: Product.find_by(name: product_quantity.keys.first)).first
        emp_product_quantity.update(quantity: (emp_product_quantity.quantity - product_quantity.values.first.to_i))
      end
    end

    pdf = Prawn::Document.new(page_size: 'A4')

    table_data = []

    table_data << ["Invoice: #{id}", "Total: #{charge}"]
    table_data << ["Provider: #{employee.name}", "Client Name: #{client.name}", "Date of Service: #{date_of_service}"]
    table_data << ["Concierge Fee Paid:#{concierge_fee_paid ? 'Yes' : 'No'}", "GFE:#{gfe ? 'Yes' : 'No'}", "Paid By Client Cash:#{paid_by_client_cash}", "Paid By Client Credit:#{paid_by_client_credit}", "Total Paid by Credit:#{paid_by_client_cash.to_i + paid_by_client_credit.to_i if (paid_by_client_cash && paid_by_client_credit)}"]
    table_data << ["Personal Discount: #{personal_discount}", "Tip: #{tip}", "Comments: #{comments}"]

    pdf.table(table_data, position: :left)

    if products_hash["products"].any?
      product_heading = [["Products:   "]]
      pdf.table(product_heading, position: :left)

      product_table_data = []
      product_table_data << ["Products", "Quantity", "Price", "Total Price"]
      products_hash["products"]&.each do |product|
        product_table_data << [product&.first, product&.second, product&.third, (product.second.to_i * product.third.to_i)]
      end

      pdf.table(product_table_data, position: :left, :column_widths => [200, 100, 100, 100])
    end

    if products_hash["retail_products"].any?
      retail_product_heading = [["Retail Products:   "]]
      pdf.table(retail_product_heading, position: :left)

      retail_product_table_data = []
      retail_product_table_data << ["Products", "Quantity", "Price", "Total Price"]

      products_hash["retail_products"].each do |product|
        retail_product_table_data << [product&.first, product&.second, product&.third, (product.second.to_i * product.third.to_i)]
      end

      pdf.table(retail_product_table_data, :cell_style => { inline_format: true }, position: :left, :column_widths => [200, 100, 100, 100])
    end

    # overhead_table_data = []
    # overhead_table_data << ["Overhead:   "]
    # overhead_table_data <<["Fee Type: #{overhead_fee_type.capitalize}", "Fee Value: #{overhead_fee_value}"]

    # pdf.table(overhead_table_data, :cell_style => { inline_format: true }, position: :left, :column_widths => [200, 200])

    pdf_file = pdf.render_file("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf")
    document.attach(io: File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    save!

    SendNotificationPdfToAdminsMailer.with(invoice: self).send_mail.deliver
    File.delete("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf")
  end

  def finalize_and_send_pdf_mail
    pdf = Prawn::Document.new(page_size: 'A4')

    table_data = []

    table_data << ["Invoice: #{id}", "Total: #{charge}"]
    table_data << ["Provider: #{employee.name}", "Client Name: #{client.name}", "Date of Service: #{date_of_service}"]
    table_data << ["Concierge Fee Paid:#{concierge_fee_paid ? 'Yes' : 'No'}", "GFE:#{gfe ? 'Yes' : 'No'}", "Paid By Client Cash:#{paid_by_client_cash}", "Paid By Client Credit:#{paid_by_client_credit}", "Total Paid by Credit:#{paid_by_client_cash.to_i + paid_by_client_credit.to_i if (paid_by_client_cash && paid_by_client_credit)}"]
    table_data << ["Personal Discount: #{personal_discount}", "Tip: #{tip}", "Comments: #{comments}"]

    pdf.table(table_data, position: :left)

    if products_hash["products"].any?
      product_heading = [["Products:   "]]
      pdf.table(product_heading, position: :left)

      product_table_data = []
      product_table_data << ["Products", "Quantity", "Price", "Total Price"]
      products_hash["products"]&.each do |product|
        product_table_data << [product&.first, product&.second, product&.third, (product.second.to_i * product.third.to_i)]
      end

      pdf.table(product_table_data, position: :left, :column_widths => [200, 100, 100, 100])
    end

    if products_hash["retail_products"].any?
      retail_product_heading = [["Retail Products:   "]]
      pdf.table(retail_product_heading, position: :left)

      retail_product_table_data = []
      retail_product_table_data << ["Products", "Quantity", "Price", "Total Price"]

      products_hash["retail_products"].each do |product|
        retail_product_table_data << [product&.first, product&.second, product&.third, (product.second.to_i * product.third.to_i)]
      end

      pdf.table(retail_product_table_data, :cell_style => { inline_format: true }, position: :left, :column_widths => [200, 100, 100, 100])
    end

    overhead_table_data = []
    overhead_table_data << ["Overhead:   "]
    overhead_table_data <<["Fee Type: #{overhead_fee_type.capitalize}", "Fee Value: #{overhead_fee_value}"]

    pdf.table(overhead_table_data, :cell_style => { inline_format: true }, position: :left, :column_widths => [200, 200])

    pdf_file = pdf.render_file("public/#{employee.name}-Finalized-Invoice-#{id}.pdf")

    document.purge # To remove the non-finalized document
    document.attach(io: File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    update!(is_finalized: true)
    SendPdfToInvoiceMailer.with(invoice: self).send_mail.deliver
  end

  def reject_and_send_mail(feedback)
    if RejectInvoiceMailer.with(invoice: self, feedback: feedback).send_mail.deliver
      destroy!
    end
  end

  private
  def revise_charge
    if (overhead_fee_type && overhead_fee_type_changed?) || (overhead_fee_value && overhead_fee_value_changed?)
      self.charge -=  case overhead_fee_type
                      when "percentage"
                        (charge*overhead_fee_value/100)
                      when "fixed"
                        overhead_fee_value
                      end.round(2)
    end
  end

  def return_inventory
    if products_hash && products_hash.any?
      products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
        emp_product_quantity = employee.employees_inventories.find_or_create_by(product: Product.find_by(name: product_quantity.keys.first))
        emp_product_quantity.update!(quantity: (emp_product_quantity.quantity.to_i + product_quantity.values.first.to_i))
      end
    end
  end
end

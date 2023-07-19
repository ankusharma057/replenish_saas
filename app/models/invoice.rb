class Invoice < ApplicationRecord
  require 'wicked_pdf'

  include PdfDownloadable

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

    pdf_string = get_html(products_hash)
    pdf_modified_string = pdf_string.blank? ? "<div>No Data</div>" : pdf_string
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
      file << pdf
    end

    document.attach(io: File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    save!

    SendNotificationPdfToAdminsMailer.with(invoice: self).send_mail.deliver
    File.delete("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf")
  end

  def finalize_and_send_pdf_mail 
    # products_hash["Products"] = products_hash["products"]
    # products_hash["Retail Products"] = products_hash["retail_products"]
    # products_hash.except!("products", "retail_products")

    pdf_string = get_html_finalized(products_hash)
    pdf_modified_string = pdf_string.blank? ? "<div>No Data</div>" : pdf_string
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
      file << pdf
    end

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
    if (charge && charge_changed?) ||
      (overhead_fee_type && overhead_fee_type_changed?) ||
      (overhead_fee_value && overhead_fee_value_changed?)

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

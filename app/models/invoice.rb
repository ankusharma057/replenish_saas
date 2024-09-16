class Invoice < ApplicationRecord
  require 'wicked_pdf'

  include PdfDownloadable

  belongs_to :employee
  belongs_to :client
  belongs_to :invoice_group
  belongs_to :source_invoice, class_name: 'Invoice', foreign_key: 'source_invoice_id', optional: true

  has_many :products_invoices, class_name: 'ProductInvoice'
  has_many :products, through: :products_invoices
  has_one_attached :document, dependent: :purge
  has_many_attached :before_images
  has_many_attached :after_images
  
  validates_presence_of :overhead_fee_type, on: :update, if: lambda{ |invoice| invoice.overhead_fee_value.present? }

  # before_update :revise_charge
  before_destroy -> { return_inventory if !self.is_finalized }, if: -> { !self.is_finalized }
  before_destroy -> { verify_fellow_invoices if !self.is_finalized }, if: -> { !self.is_finalized }

  scope :finalized, -> { where(is_finalized: true) }
  scope :non_finalized, -> { where(is_finalized: false) }

  # def save_pdf_and_send_mail(products, retail_products)
    # products_hash["products"] = products
    # products_hash["retail_products"] = retail_products

    # if products_hash && products_hash.any?
    #   products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
    #     emp_product_quantity = employee.employees_inventories.where(product: Product.find_by(name: product_quantity.keys.first)).first
    #     emp_product_quantity.update(quantity: (emp_product_quantity.quantity - product_quantity.values.first.to_f))
    #   end
    # end

    # pdf_string = get_html(products_hash)
    # pdf_modified_string = pdf_string.blank? ? "<div>No Data</div>" : pdf_string
    # pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    # File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
    #   file << pdf
    # end

    # document.attach(io: File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    # save!

    # SendNotificationPdfToAdminsMailer.with(invoice: self).send_mail.deliver
    # File.delete("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf")
  # end

  def finalize_and_attach_pdf
    pdf_string = get_html_finalized(products_hash)
    pdf_modified_string = pdf_string.blank? ? "<div>No Data</div>" : pdf_string
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)

    File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
      file << pdf
    end

    # document.purge -- To remove the non-finalized document
    document.attach(io: File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    update!(is_finalized: true)
  end

  def reject_and_send_mail(feedback)
    if RejectInvoiceMailer.with(invoice: self, feedback: feedback).send_mail.deliver
      destroy!
    end
  end

  def fellow_invoices
    invoice_group.fellow_invoices(self)
  end

  def fellow_invoices_finalized?
    !fellow_invoices.map(&:is_finalized).include?(false)
  end

  def send_group_pdf_mails
    invoice_group.send_finalized_mails(self.source_invoice_id.blank?)
  end

  private

  # def revise_charge
  #   if (charge && charge_changed?) ||
  #     (overhead_fee_type && overhead_fee_type_changed?) ||
  #     (overhead_fee_value && overhead_fee_value_changed?)

  #     self.charge -=  case overhead_fee_type
  #                     when "percentage"
  #                       (charge*overhead_fee_value/100)
  #                     when "fixed"
  #                       overhead_fee_value
  #                     end.round(2)
  #   end
  # end

  scope :with_associations, -> {
    includes(
      :products,
      :employee,
      :client,
      :before_images_attachments,
      :after_images_attachments,
      :invoice_group
    )
  }

  scope :filter_by_finalized, -> (is_finalized) {
    where(is_finalized: is_finalized) if is_finalized.present?
  }

  def self.paginated_invoices(params)
    with_associations
      .filter_by_finalized(params[:is_finalized])
      .paginate(page: params[:page], per_page: params[:per_page] || 12)
  end

  def return_inventory
    if products_hash && products_hash.any?
      products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
        emp_inventory = employee.employees_inventories.find_or_create_by(product: Product.find_by(name: product_quantity.keys.first))
        emp_inventory.update!(quantity: (emp_inventory.quantity.to_f + product_quantity.values.first.to_f))
      end
    end
  end

  def verify_fellow_invoices
    unless fellow_invoices.any? 
      SendRejectInvoiceGroupMail.with(invoice: self).send_group_rejection_mail.deliver_now
    end
  end
end

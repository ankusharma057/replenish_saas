# frozen_string_literal: true

class Invoice < ApplicationRecord
  require 'wicked_pdf'

  include PdfDownloadable
  has_paper_trail only: %i[charge instant_pay]
  belongs_to :employee
  belongs_to :mentor, class_name: 'Employee', optional: true
  belongs_to :client
  belongs_to :invoice_group
  belongs_to :source_invoice, class_name: 'Invoice', optional: true

  has_many :products_invoices, class_name: 'ProductInvoice', dependent: :nullify
  has_many :products, through: :products_invoices
  has_one_attached :document, dependent: :purge
  has_many_attached :before_images
  has_many_attached :after_images
  belongs_to :location, optional: true

  scope :filter_by_date, lambda { |start_date, end_date|
    where(date_of_service: start_date..end_date) if start_date.present? && end_date.present?
  }
  scope :filter_by_location, lambda { |location_ids|
    where(location_id: location_ids) if location_ids.is_a?(Array)
  }

  scope :filter_by_employee, lambda { |employee_ids|
    where(employee_id: employee_ids) if employee_ids.is_a?(Array)
  }

  validates :overhead_fee_type, presence: { on: :update, if: ->(invoice) { invoice.overhead_fee_value.present? } }

  enum :payment_status, { pending: 'pending', initiated: 'initiated', completed: 'completed' }
  enum payment_type: { credit_card: 0, cherry: 1, other: 2 }
  # before_update :revise_charge
  before_create :set_default_status
  before_destroy -> { return_inventory unless is_finalized }, if: -> { !is_finalized }
  before_destroy -> { verify_fellow_invoices unless is_finalized }, if: -> { !is_finalized }

  scope :finalized, -> { where(is_finalized: true) }
  scope :non_finalized, -> { where(is_finalized: false) }

  def finalize_and_attach_pdf
    pdf_string = get_html_finalized(products_hash)
    pdf_modified_string = pdf_string.presence || '<div>No Data</div>'
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)

    File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
      file << pdf
    end

    # document.purge -- To remove the non-finalized document
    document.attach(io: File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf"),
                    filename: "#{employee.name}-Finalized-Invoice-#{id}.pdf", content_type: 'application/pdf')

    update!(is_finalized: true)
  end

  def reject_and_send_mail(feedback)
    return unless RejectInvoiceMailer.with(invoice: self, feedback: feedback).send_mail.deliver

    destroy!
  end

  def fellow_invoices
    invoice_group.fellow_invoices(self)
  end

  def fellow_invoices_finalized?
    fellow_invoices.map(&:is_finalized).exclude?(false)
  end

  def send_group_pdf_mails
    invoice_group.send_finalized_mails(source_invoice_id.blank?)
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

  scope :with_associations, lambda {
    includes(
      :products,
      :client,
      :before_images_attachments,
      :after_images_attachments,
      :invoice_group,
      employee: [:roles]
    )
  }

  scope :filter_by_finalized, lambda { |is_finalized|
    where(is_finalized: is_finalized) if is_finalized.present?
  }

  class << self
    def paginated_invoices(params)
      with_associations
        .filter_by_finalized(params[:is_finalized])
        .order(created_at: :desc)
        .paginate(page: params[:page], per_page: params[:per_page] || 12)
    end

    def search(query, field = nil)
      return all if query.blank?

      case field
      when 'invoice_id'
        where('id::text LIKE ?', "%#{query}%")
      when 'client_name'
        joins(:client).where(
          'clients.name ILIKE :query OR clients.last_name ILIKE :query OR ' \
          "CONCAT(clients.name, ' ', clients.last_name) ILIKE :query",
          query: "%#{query}%"
        )
      when 'employee_name'
        joins(:employee).where('employees.name ILIKE ?', "%#{query}%")
      else
        none
      end
    end
  end

  def return_inventory
    return unless products_hash&.any?

    products_hash.values.flatten(1).map { |arr| { arr[0] => arr[1] } }.each do |product_quantity|
      emp_inventory = employee.employees_inventories.find_or_create_by(
        product: Product.find_by(name: product_quantity.keys.first)
      )

      emp_inventory.update!(quantity: (emp_inventory.quantity.to_f + product_quantity.values.first.to_f))
    end
  end

  def verify_fellow_invoices
    return if fellow_invoices.any?

    SendRejectInvoiceGroupMail.with(invoice: self).send_group_rejection_mail.deliver_now
  end

  def set_default_status
    self.payment_status ||= 'pending'
  end

  def old_invoice?
    amt_paid_for_mp_products.nil? &&
    amt_paid_for_products.nil? &&
    amt_paid_for_retail_products.nil? &&
    amt_paid_for_wellness_products.nil?
  end
  
  def amount_client_paid
    amt_paid_for_products.to_f +
    amt_paid_for_retail_products.to_f +
    amt_paid_for_mp_products.to_f +
    amt_paid_for_wellness_products.to_f
  end
end

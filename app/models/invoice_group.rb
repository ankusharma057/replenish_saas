# frozen_string_literal: true

class InvoiceGroup < ApplicationRecord
  has_many :invoices, dependent: :destroy
  has_one_attached :document, dependent: :purge

  scope :source_invoices, -> { where(source_invoice_id: nil) }
  scope :mentor_invoices, -> { where.not(source_invoice_id: nil) }

  include PdfGroupDownloadable
  include MentorPdfDownloadable

  def source_invoices
    invoices.where(source_invoice_id: nil)
  end

  def mentor_invoices
    invoices.where.not(source_invoice_id: nil)
  end

  def fellow_invoices(invoice)
    if invoice.source_invoice_id.blank?
      source_invoices.where.not(id: invoice.id)
    else
      mentor_invoices.where.not(id: invoice.id)
    end
  end

  def generate_pdfs_and_send_mails
    save_pdfs_and_send_mail

    save_mentor_pdf_and_send_email if mentor_invoices.present?
  end

  def save_pdfs_and_send_mail
    pdf_string = html_for_group
    pdf_modified_string = pdf_string.presence || '<div>No Data</div>'
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)

    file_path = "public/#{source_invoices.first.employee&.name}-Non-Finalized-Invoice-Group-#{source_invoices.ids}.pdf"

    File.open(file_path, 'wb') do |file|
      file << pdf
    end

    filename = "#{source_invoices.first.employee&.name&.capitalize}" \
               "-Non-Finalized-Invoice-Group-#{source_invoices.ids}.pdf"

    document.attach(
      io: File.open(file_path),
      filename: filename,
      content_type: 'application/pdf'
    )

    save!

    SendNotificationPdfToAdminsMailer.with(group: self, invoices: source_invoices).send_mail.deliver
  end

  def save_mentor_pdf_and_send_email
    pdf_string = get_mentor_html_for_group
    pdf_modified_string = pdf_string.presence || '<div>No Data</div>'
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{mentor_invoices.first.employee&.name}-Non-Finalized-Invoice-Group-#{mentor_invoices.ids}.pdf",
              'wb') do |file|
      file << pdf
    end

    file_path = "public/#{mentor_invoices.first.employee&.name}-Non-Finalized-Invoice-Group-#{mentor_invoices.ids}.pdf"
    filename = "#{mentor_invoices.first.employee&.name&.capitalize}" \
               "-Non-Finalized-Invoice-Group-#{mentor_invoices.ids}.pdf"

    document.attach(
      io: File.open(file_path),
      filename: filename,
      content_type: 'application/pdf'
    )

    save!

    SendMentorNotificationPdfToAdminsMailer.with(group: self, invoices: mentor_invoices).send_mail.deliver
  end

  def send_finalized_mails(for_source_invoices = true)
    if for_source_invoices
      send_finalized_mail
    else
      send_mentor_finalized_mail
    end
  end

  def send_finalized_mail
    pdf_string = html_for_group_finalized
    pdf_modified_string = pdf_string.presence || '<div>No Data</div>'
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{source_invoices.first.employee&.name}-Finalized-Invoice-Group-#{source_invoices.ids}.pdf",
              'wb') do |file|
      file << pdf
    end

    document.purge # To remove the non-finalized document
    file_path = "public/#{source_invoices.first.employee&.name}-Finalized-Invoice-Group-#{source_invoices.ids}.pdf"
    filename = "#{source_invoices.first.employee&.name}-Finalized-Invoice-Group-#{source_invoices.ids}.pdf"

    document.attach(
      io: File.open(file_path),
      filename: filename,
      content_type: 'application/pdf'
    )

    update!(finalized_totally: true)
    SendPdfToInvoiceMailer.with(group: self, invoices: source_invoices).send_mail.deliver
  end

  def send_mentor_finalized_mail
    pdf_string = get_mentor_html_for_group_finalized
    pdf_modified_string = pdf_string.presence || '<div>No Data</div>'
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{mentor_invoices.first.employee&.name}-Finalized-Invoice-Group-#{mentor_invoices.ids}.pdf",
              'wb') do |file|
      file << pdf
    end

    document.purge # To remove the non-finalized document
    file_path = "public/#{mentor_invoices.first.employee&.name}-Finalized-Invoice-Group-#{mentor_invoices.ids}.pdf"
    filename = "#{mentor_invoices.first.employee&.name}-Finalized-Invoice-Group-#{mentor_invoices.ids}.pdf"

    document.attach(
      io: File.open(file_path),
      filename: filename,
      content_type: 'application/pdf'
    )

    update!(finalized_totally: true)
    SendMentorPdfToInvoiceMailer.with(group: self, invoices: mentor_invoices).send_mail.deliver
  end
end

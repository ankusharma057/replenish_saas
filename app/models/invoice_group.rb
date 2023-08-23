class InvoiceGroup < ApplicationRecord
  has_many :invoices
  has_one_attached :document, dependent: :purge

  include PdfGroupDownloadable

  def save_pdfs_and_send_mail
    pdf_string = get_html_for_group
    pdf_modified_string = pdf_string.blank? ? "<div>No Data</div>" : pdf_string
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{invoices.first.employee.name}-Non-Finalized-Invoice-Group-#{invoices.ids}.pdf", 'wb') do |file|
      file << pdf
    end

    document.attach(io: File.open("public/#{invoices.first.employee.name}-Non-Finalized-Invoice-Group-#{invoices.ids}.pdf"), filename: "#{invoices.first.employee.name.capitalize}-Non-Finalized-Invoice-Group-#{invoices.ids}.pdf", content_type: "application/pdf")

    save!

    SendNotificationPdfToAdminsMailer.with(group: self).send_mail.deliver
  end

  def send_finalized_mail
    pdf_string = get_html_for_group_finalized
    pdf_modified_string = pdf_string.blank? ? "<div>No Data</div>" : pdf_string
    pdf = WickedPdf.new.pdf_from_string(pdf_modified_string)
    File.open("public/#{invoices.first.employee.name}-Finalized-Invoice-Group-#{invoices.ids}.pdf", 'wb') do |file|
      file << pdf
    end

    document.purge # To remove the non-finalized document
    document.attach(io: File.open("public/#{invoices.first.employee.name}-Finalized-Invoice-Group-#{invoices.ids}.pdf"), filename: "#{invoices.first.employee.name}-Finalized-Invoice-Group-#{invoices.ids}.pdf", content_type: "application/pdf")

    update!(finalized_totally: true)
    SendPdfToInvoiceMailer.with(group: self).send_mail.deliver
  end
end

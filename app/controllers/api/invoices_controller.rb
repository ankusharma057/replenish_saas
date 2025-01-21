# frozen_string_literal: true

class Api::InvoicesController < ApplicationController
  include Rails.application.routes.url_helpers
  skip_before_action :authorized_employee
  # before_action :find_employee, only: :create
  before_action :find_invoice, only: %i(finalize update send_reject_mail download_attachment update_images mark_paid)

  def index
    invoices = Invoice.all
    render json: invoices, status: :ok
  end

  def show
    invoice = Invoice.find(params[:id])

    if invoice.document.attached?
      pdf_url = Rails.application.routes.url_helpers.rails_blob_url(
        invoice.document,
        host: request.host_with_port,
        only_path: false
      )

      render json: {
        pdf_url: pdf_url,
        invoice: invoice
      }, status: :ok
    else
      render json: { error: 'PDF not found' }, status: :not_found
    end
  end


  def update
    if @invoice.update!(invoice_params)
      render json: @invoice, status: :ok
    else
      render json: { 'error' => 'Failed to Update Invoice' }, status: :bad_request
    end
  end

  def update_images
    remove_images_from_blobs
    decoded_before_images_data = params['blobsForBefore'].map { |data| Base64.decode64(data.sub("data:image/png;base64,", '')) }

    decoded_before_images_data.each_with_index do |before_image, index|
      filename = "#{@invoice.id}-before-image-#{rand(100)}.png"
      file_path = File.join(Rails.root+'tmp', filename)
      File.open(file_path, 'wb') { |file| file.write(before_image) }
      @invoice.before_images.attach(io: File.open(file_path),filename: filename)
      File.delete(file_path) if File.exist?(file_path)
    end

    decoded_after_images_data = params['blobsForAfter'].map { |data| Base64.decode64(data.sub("data:image/png;base64,", '')) }

    decoded_after_images_data.each_with_index do |after_image, index|
      filename = "#{@invoice.id}-after-image-#{rand(100)}.png"
      file_path = File.join(Rails.root+'tmp', filename)
      File.open(file_path, 'wb') { |file| file.write(after_image) }
      @invoice.after_images.attach(io: File.open(file_path),filename: filename)
      File.delete(file_path) if File.exist?(file_path)
    end

    render json: @invoice, status: :ok
  end

  def finalize
    if @invoice.finalize_and_attach_pdf
      if @invoice.fellow_invoices_finalized?
        @invoice.send_group_pdf_mails
        return render json: @invoice, status: :ok
      else
        return render json: {'message' => "Finalize Invoices: #{@invoice.fellow_invoices.where(is_finalized: false).ids} to receive the mail"}, status: :unprocessable_entity
      end
    else
      return render json: {'error' => 'Invoice not found'}, status: :not_found
    end
  end

  def finalize_multiple
    invoice_ids = params["_json"].pluck(:id)
    invoices = Invoice.includes(:employee, :client, :invoice_group, :document_attachment, :document_blob)
                      .where(id: invoice_ids)

    message_hash = { success: [] }
    invoices.each do |invoice|
      if invoice.finalize_and_attach_pdf
        if invoice.fellow_invoices_finalized?
          invoice.send_group_pdf_mails
          message_hash[:success] << "Invoice #{invoice.id} Finalized" 
        else
          message_hash[:success] << "Finalize Invoices: #{invoice.fellow_invoices.where(is_finalized: false).ids} to receive the mail"
        end
      else
        return render json: { 'error' => 'Invoice not found' }, status: :not_found
      end
    end

    render json: { 'message' => message_hash[:success] }, status: :ok
  end

  def send_reject_mail
    fellow_invoices = @invoice.fellow_invoices
    fellow_invoices_finalized = @invoice.fellow_invoices_finalized?
    @invoice.reject_and_send_mail(params[:feedback])
    unless fellow_invoices.blank?
      fellow_invoices.first.send_group_pdf_mails if fellow_invoices && fellow_invoices_finalized
    end
    end
    
  def download_attachment
    if @invoice.document.attached?
      path = ActiveStorage::Blob.service.path_for(@invoice.document.key)
      send_data File.open(path, 'rb').read, type: 'application/pdf', disposition: 'attachment', filename: 'Note.pdf'
    else
      return render json: {'error' => 'Invoice not found'}, status: :not_found
    end
  end

  def destroy
    @invoice = Invoice.find_by(id: params[:id])
    if @invoice.present? && @invoice.destroy
      render json: @invoice, status: :ok
    else
      render json: {'error' => 'Invoice not found or Unable to delete'}, status: :not_found
    end
  end

  def mark_paid
    if @invoice.nil?
      render json: { message: 'Invoice not found' }, status: :not_found
      return
    end
    
    @invoice.update(is_paid: true)

    if @invoice.save
      render json: { message: 'Invoice marked as paid successfully', invoice: @invoice }, status: :ok
    else
      render json: { message: 'Failed to mark invoice as paid' }, status: :unprocessable_entity
    end
  end

  def client_invoices
    invoices = Invoice.where(client_id: params[:id])
    if invoices.present?
      invoices = invoices.where(location_id: params[:location_id]) if params[:location_id].present?
      invoices = invoices.where(employee_id: params[:employee_id]) if params[:employee_id].present?
      invoices = invoices.where(is_paid: params[:is_paid]) if params[:is_paid].present?
      if params[:start_date].present? && params[:end_date].present?
        invoices = invoices.where("DATE(created_at) BETWEEN ? AND ?", date_parse(params[:start_date]), date_parse(params[:end_date]))
      elsif params[:start_date].present? 
        invoices = invoices.where("DATE(created_at) >= ?", date_parse(params[:start_date]))
      elsif params[:end_date].present?
        invoices = invoices.where("DATE(created_at) <= ?", date_parse(params[:end_date]))
      end
      if params[:invoice_age].present?
        today = Date.current
        case params[:invoice_age]
        when '0-30'
          invoices = invoices.where("DATE(created_at) >= ?", today - 30.days)
        when '31-60'
          invoices = invoices.where("DATE(created_at) BETWEEN ? AND ?", today - 60.days, today - 31.days)
        when '61-90'
          invoices = invoices.where("DATE(created_at) BETWEEN ? AND ?", today - 90.days, today - 61.days)
        when '91-120'
          invoices = invoices.where("DATE(created_at) BETWEEN ? AND ?", today - 120.days, today - 91.days)
        end
      end
      render json: invoices, status: :ok
    else
      render json: { message: 'Invoice not found' }, status: :not_found 
    end
  end

  def print_receipt
    invoices = Invoice.where(client_id: params[:client_id])
    invoices = invoices.where(employee_id: params[:employee_id]) if params[:employee_id].present?

    if invoices.present?
      pdf_html = ActionController::Base.new.render_to_string(
        template: 'api/invoices/print_receipt',
        assigns: { invoices: invoices },
        layout: 'pdf'
      )
      @pdf = WickedPdf.new.pdf_from_string(pdf_html)
      filename = params[:employee_id].present? ? "Invoices_#{params[:client_id]}_#{params[:employee_id]}.pdf" : "Invoices_#{params[:client_id]}_all.pdf"
      send_data @pdf, filename: filename, type: 'application/pdf', disposition: 'inline'
    else
      render json: { message: 'Invoice not found' }, status: :not_found
    end
  end


  def email_receipt
    @invoices = Invoice.where(employee_id: params[:id], client_id: params[:client_id])
    if @invoices.present?
      recipient_email = @invoices.first.client.email
      if recipient_email.present?
        InvoiceMailer.send_invoice(@invoices, recipient_email).deliver_now
        render json: { message: 'Invoice emailed successfully' }, status: :ok
      else
        render json: { message: 'Recipient email is required' }, status: :unprocessable_entity
      end
    else
      render json: { message: 'Invoice not found' }, status: :not_found
    end
  end


  private

  def date_parse(date_string)
    Date.strptime(date_string, '%m-%d-%Y')
  rescue ArgumentError => e
    Rails.logger.error("Date parse error: #{e.message}")
    nil
  end
  
  def invoice_params
    params.require(:invoice).permit(:employee_id, :client_id, :charge, :is_finalized, :date_of_service, :paid_by_client_cash, :paid_by_client_credit, :comments, :personal_discount, :tip, :concierge_fee_paid, :gfe, :provider_purchased, :overhead_fee_type, :overhead_fee_value, :notes, :instant_pay)
  end

  def find_invoice
    @invoice = Invoice.includes(:employee, :client).find_by(id: params[:id])
  end

  def remove_images_from_blobs
    filenames = (params[:deletedBeforeImages] + params[:deletedAfterImages]).map{|img| img.split('/').last}
    attachments = ActiveStorage::Attachment.where(record_type: "Invoice", record_id: params[:id])
    attachments.each do|attachment|
      attachment.destroy if filenames.include?(attachment.blob.filename.to_s)
    end
  end
end

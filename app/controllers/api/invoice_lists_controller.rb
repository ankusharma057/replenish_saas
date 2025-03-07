# frozen_string_literal: true

class Api::InvoiceListsController < ApplicationController
  def index
    invoices = Invoice.includes(:location).where(mentor_id: nil).search(params[:query],
                                                                        params[:field]).paginated_invoices(params)
    render json: {
      invoices: ActiveModelSerializers::SerializableResource.new(invoices, each_serializer: InvoiceListSerializer),
      current_page: invoices.current_page,
      total_pages: invoices.total_pages,
      total_entries: invoices.total_entries
    }, status: :ok
  end

  def employee_invoices
    if params[:employee_id].present?
      @employee = Employee.find_by(id: params[:employee_id])
      invoices = @employee.invoices.joins(:client).select('invoices.id, clients.name as client_name')
    else
      invoices = []
    end
    render json: invoices.map { |invoice| { id: invoice.id, client_name: invoice.client_name } }, status: :ok
  end

  def mentorship_invoices
    invoices = if params[:is_admin] == 'true'
                 Invoice.where.not(mentor_id: nil).order(created_at: :desc)
               else
                 Invoice.where(employee_id: params[:employee_id]).where.not(mentor_id: nil).order(created_at: :desc)
               end

    render json: invoices, each_serializer: MentorInvoiceSerializer, status: :ok
  end

  def summary
    invoices = filtered_invoices_with_date_range
    summary_data = calculate_summary_data(invoices)
    total_invoiced_sum = summary_data.sum { |data| data[:total_invoiced] }
    total_applied_sum = summary_data.sum { |data| data[:total_applied] }

    start_date = if params[:start_date].present?
                   Date.strptime(params[:start_date], '%Y-%m-%d')
                 else
                   Time.zone.today.beginning_of_month
                 end
    end_date = params[:end_date].present? ? Date.strptime(params[:end_date], '%Y-%m-%d') : Time.zone.today.end_of_month

    schedules = Schedule.where(is_cancelled: false)
                        .where(created_at: start_date..end_date)
                        .includes(treatments: :product)

    product_income = schedules.sum do |schedule|
      schedule.treatments.sum do |treatment|
        treatment.product.retail_price * treatment.quantity
      end
    end

    treatment_income = schedules.sum do |schedule|
      schedule.treatments.sum(&:cost)
    end
    mentor_income = invoices.sum { |invoice| calculate_charge(invoice) }
    render json: {
      data: summary_data,
      total_summary: {
        total_invoiced: total_invoiced_sum,
        total_applied: total_applied_sum
      },
      sales_breakdown: {
        product_income: product_income,
        treatment_income: treatment_income,
        mentor_income: mentor_income
      },
      current_month_dates: {
        start_date: start_date.strftime('%Y-%m-%d'),
        end_date: end_date.strftime('%Y-%m-%d')
      }
    }, status: :ok
  end

  def export_invoices
    invoices = filtered_invoices_with_date_range
    summary_data = calculate_summary_data(invoices)

    package = generate_excel_file(summary_data)
    timestamp = Time.zone.now.strftime('%Y%m%d%H%M%S')
    send_data package.to_stream.read,
              filename: "invoices_summary_#{timestamp}.xlsx",
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              disposition: 'attachment'
  end

  def location_pdf
    location_id = params[:location_id]
    @location = Location.find(location_id)
    if @location.present?
      @start_date = if params[:start_date].present?
                      Date.strptime(params[:start_date], '%Y-%m-%d')
                    else
                      Time.zone.today.beginning_of_month
                    end
      @end_date = if params[:end_date].present?
                    Date.strptime(params[:end_date], '%Y-%m-%d')
                  else
                    Time.zone.today.end_of_month
                  end
      @invoices = Invoice.where(location_id: location_id, created_at: @start_date..@end_date)

      if @invoices.present?
        @product_income = @invoices.sum { |invoice| calculate_product_income(invoice) }
        @treatment_income = @invoices.sum { |invoice| calculate_charge(invoice) } - @product_income
        @applied_income = @invoices.sum { |data| data[:charge] }
        @total_invoiced = @treatment_income + @product_income

        pdf_html = ActionController::Base.new.render_to_string(
          template: 'api/invoice_lists/location_report',
          layout: 'pdf',
          locals: {
            location: @location,
            invoices: @invoices,
            treatment_income: @treatment_income,
            product_income: @product_income,
            total_invoiced: @total_invoiced,
            percentage_invoiced: calculate_location_invoices(@invoices),
            start_date: @start_date,
            end_date: @end_date,
            applied_income: @applied_income
          }
        )

        pdf = WickedPdf.new.pdf_from_string(pdf_html)
        send_data pdf, filename: "location_#{@location.id}_report.pdf", type: 'application/pdf', disposition: 'inline'
      else
        pdf_html = ActionController::Base.new.render_to_string(
          template: "api/invoice_lists/location_report_blank", # You can create a blank template if needed
          layout: "pdf",
          locals: {
            location: @location,
            invoices: [],
            treatment_income: 0,
            product_income: 0,
            total_invoiced: 0,
            percentage_invoiced: 0,
            start_date: @start_date,
            end_date: @end_date,
            applied_income: 0
          }
        )

        pdf = WickedPdf.new.pdf_from_string(pdf_html)
        send_data pdf, filename: "location_#{@location.id}_report.pdf", type: 'application/pdf', disposition: 'inline'
      end
    else
      render json: { 'error' => 'Location not found' }, status: :not_found
    end
  end

  def finalized_invoice
    invoices = Invoice.includes(:location).where(mentor_id: nil, is_finalized: true).paginated_invoices(params)
    render json: {
      invoices: ActiveModelSerializers::SerializableResource.new(invoices, each_serializer: InvoiceListSerializer),
      current_page: invoices.current_page,
      total_pages: invoices.total_pages,
      total_entries: invoices.total_entries
    }, status: :ok
  end

  def mentors_invoice
    if params[:employee_id].present?
      @employee = Employee.find_by(id: params[:employee_id])
      invoices = @employee.invoices.where(is_finalized: true).includes(:client).paginated_invoices(params)
    else
      invoices = []
    end
    render json: {
      invoices: ActiveModelSerializers::SerializableResource.new(invoices, each_serializer: InvoiceListSerializer),
      current_page: invoices.current_page,
      total_pages: invoices.total_pages,
      total_entries: invoices.total_entries
    }, status: :ok
  end

  private

  def calculate_summary_data(invoices)
    all_locations = Location.all.index_by(&:id)
    invoices_by_location = invoices.group_by(&:location_id)
    all_locations.map do |location_id, location|
      grouped_invoices = invoices_by_location[location_id] || []
      total_invoiced = grouped_invoices.sum { |invoice| calculate_charge(invoice) }
      
      {
        location_id: location_id,
        location_name: location.name,
        percentage_invoiced: calculate_percentage_invoiced(grouped_invoices),
        total_invoiced: total_invoiced.round(2),
        total_applied: calculate_total_applied(grouped_invoices).round(2)
      }
    end
  end


  def calculate_product_income(invoice)
    products = invoice.products_hash['products'] || []
    products.sum { |product| product[2].to_f }
  end

  def calculate_charge(invoice)
    if invoice.old_invoice?
      cash = invoice.paid_by_client_cash.to_f
      credit = invoice.paid_by_client_credit.to_f
      adjusted_credit = credit - (credit * 0.031)
      consumable_cost = invoice.total_consumable_cost.to_f
      tip = invoice.tip.to_f
      discount = invoice.personal_discount.to_f
      concierge_fee = invoice.concierge_fee_paid? ? 50 : 0
      gfe_fee = invoice.gfe? ? 20 : 0
      semag_consult_fee = (cash + credit) * 0.2

      cash + adjusted_credit - consumable_cost + tip - discount + concierge_fee + gfe_fee + semag_consult_fee
    else
      invoice.charge
    end
  end

  def filtered_invoices_with_date_range
    if params[:start_date].present? && params[:end_date].present?
      start_date = Date.strptime(params[:start_date], '%Y-%m-%d')
      end_date = Date.strptime(params[:end_date], '%Y-%m-%d')
    else
      current_date = Time.zone.today
      start_date = current_date.beginning_of_month
      end_date = current_date.end_of_month
    end

    invoices = Invoice.where(is_finalized: true)
    location_ids = params[:location_id].is_a?(String) ? params[:location_id].split(',') : params[:location_id]
    employee_ids = params[:employee_id].is_a?(String) ? params[:employee_id].split(',') : params[:employee_id]

    invoices = invoices.filter_by_location(location_ids) if location_ids.present?
    invoices = invoices.filter_by_employee(employee_ids) if employee_ids.present?
    invoices.where(created_at: start_date..end_date)
  end

  def generate_excel_file(summary_data)
    Axlsx::Package.new.tap do |package|
      workbook = package.workbook
      workbook.add_worksheet(name: "Sales by Location") do |sheet|
        sheet.add_row ["Sales by Location"]
        sheet.add_row ["Location", "% Invoiced", "Invoiced", "Applied"]
        summary_data.each do |data|
          sheet.add_row [
            data[:location_name],
            "#{data[:percentage_invoiced]}%",
            "$#{format('%.2f', total_invoiced)}",
            "$#{format('%.2f', total_applied)}"
          ]
        end
        total_invoiced = summary_data.sum { |data| data[:total_invoiced] }
        total_applied = summary_data.sum { |data| data[:total_applied] }
        sheet.add_row [
          'Total inclusive of taxes',
          nil,
          "$#{format('%.2f', total_invoiced)}",
          "$#{format('%.2f', total_applied)}"
        ]
      end
    end
  end

  def calculate_location_invoices(invoices)
    total_invoices = Invoice.where(location_id: invoices.first.location_id, is_finalized:true).count
    return 0 if total_invoices.zero?

    (invoices.size.to_f / total_invoices * 100).round(2)
  end

  def calculate_percentage_invoiced(invoices)
    if params[:start_date].blank? || params[:end_date].blank?
      current_date = Date.today
      start_date = current_date.beginning_of_month
      end_date = current_date.end_of_month
    else
      start_date = Date.strptime(params[:start_date], "%Y-%m-%d")
      end_date = Date.strptime(params[:end_date], "%Y-%m-%d")
    end
    
    total_invoices = Invoice.where(created_at: start_date..end_date, is_finalized: true).where.not(location_id: nil).count
    return 0 if total_invoices.zero?

    (invoices.size.to_f / total_invoices * 100).round(2)
  end


  def calculate_total_applied(invoices)
    invoices.sum do |invoice|
      concierge_fee = invoice.concierge_fee_paid? ? 50 : 0
      gfe_fee = invoice.gfe? ? 20 : 0
      semag_consult_fee = if invoice.old_invoice?
                            (invoice.paid_by_client_cash.to_f + invoice.paid_by_client_credit.to_f) * 0.2
                          else
                            invoice.amt_paid_for_products.to_f +
                              invoice.amt_paid_for_retail_products.to_f +
                              invoice.amt_paid_for_wellness_products.to_f +
                              invoice.amt_paid_for_mp_products.to_f
                          end
      discount = invoice.personal_discount.to_f

      concierge_fee + gfe_fee + semag_consult_fee - discount
    end
  end
end

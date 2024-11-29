class Api::InvoiceListsController < ApplicationController
  require 'axlsx'

  def index
    invoices = Invoice.includes(:location).where(mentor_id: nil).paginated_invoices(params)
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
    invoices = if params[:is_admin] == "true"
      Invoice.where.not(mentor_id: nil).order(created_at: :desc)
    else
      Invoice.where(employee_id: params[:employee_id]).where.not(mentor_id: nil).order(created_at: :desc)
    end

    render json: invoices, each_serializer: MentorInvoiceSerializer, status: :ok
  end

  def summary
    invoices = Invoice.includes(:location)

    location_ids = params[:location_id].is_a?(String) ? params[:location_id].split(',') : params[:location_id]
    employee_ids = params[:employee_id].is_a?(String) ? params[:employee_id].split(',') : params[:employee_id]

    invoices = invoices.filter_by_location(location_ids) if location_ids.present?
    invoices = invoices.filter_by_date(params[:start_date], params[:end_date]) if params[:start_date].present? && params[:end_date].present?
    invoices = invoices.filter_by_employee(employee_ids) if employee_ids.present?

    summary_data = invoices.group_by(&:location_id).map do |location_id, invoices|
      location_name = location_id ? Location.find(location_id).name : "Unknown Location"
      {
        location_name: location_name,
        percentage_invoiced: calculate_percentage_invoiced(invoices),
        total_invoiced: invoices.sum(&:charge),
        total_applied: calculate_total_applied(invoices)
      }
    end

    total_invoiced_sum = summary_data.sum { |data| data[:total_invoiced] }
    total_applied_sum = summary_data.sum { |data| data[:total_applied] }

    schedules = Schedule.where(is_cancelled: false).includes(treatments: :product)

    product_income = schedules.sum do |schedule|
      schedule.treatments.sum do |treatment|
        treatment.product.retail_price * treatment.quantity
      end
    end

    treatment_income = schedules.sum do |schedule|
      schedule.treatments.sum(&:cost)
    end

    render json: {
      data: summary_data,
      total_summary: {
        total_invoiced: total_invoiced_sum,
        total_applied: total_applied_sum
      },
      sales_breakdown: {
        product_income: product_income,
        treatment_income: treatment_income
      }
    }, status: :ok
  end


  def export_invoices
    invoices = Invoice.all

    invoices = invoices.filter_by_location(params[:location_id]) if params[:location_id].present?
    invoices = invoices.filter_by_date(params[:start_date], params[:end_date]) if params[:start_date].present? && params[:end_date].present?
    invoices = invoices.filter_by_employee(params[:employee_id]) if params[:employee_id].present?

    summary_data = invoices.group_by(&:location_id).map do |location_id, invoices|
      location_name = if location_id && Location.exists?(location_id)
                        Location.find(location_id).name
                      else
                        "Unknown Location"
                      end

      {
        location_name: location_name,
        percentage_invoiced: calculate_percentage_invoiced(invoices),
        total_invoiced: invoices.sum(&:charge),
        total_applied: calculate_total_applied(invoices)
      }
    end

    package = Axlsx::Package.new
    workbook = package.workbook

    workbook.add_worksheet(name: "Sales by Location") do |sheet|
      sheet.add_row ["Location", "% Invoiced", "Invoiced", "Applied"]

      summary_data.each do |data|
        sheet.add_row [
          data[:location_name],
          "#{data[:percentage_invoiced]}%",
          "$#{'%.2f' % data[:total_invoiced]}",
          "$#{'%.2f' % data[:total_applied]}"
        ]
      end
      total_invoiced = summary_data.sum { |data| data[:total_invoiced] }
      total_applied = summary_data.sum { |data| data[:total_applied] }
      sheet.add_row ["Total inclusive of taxes", nil, "$#{'%.2f' % total_invoiced}", "$#{'%.2f' % total_applied}"]
    end
    timestamp = Time.now.strftime('%Y%m%d%H%M%S')
    temp_file_path = Rails.root.join('tmp', "invoices_summary_#{timestamp}.xlsx")
    package.serialize(temp_file_path.to_s) 
    send_file temp_file_path.to_s, 
              filename: "invoices_summary_#{timestamp}.xlsx", 
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
              disposition: 'attachment'
    File.delete(temp_file_path) if File.exist?(temp_file_path)
  end

  private

  def calculate_percentage_invoiced(invoices)
    total_invoices = Invoice.count
    return 0 if total_invoices.zero?

    (invoices.size.to_f / total_invoices * 100).round(2)
  end

  def calculate_total_applied(invoices)
    invoices.sum(&:paid_by_client_cash) + invoices.sum(&:paid_by_client_credit)
  end
end
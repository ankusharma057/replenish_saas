require 'rails_helper'

RSpec.describe Api::InvoiceListsController, type: :controller do
  let!(:location) { create(:location) }
  let!(:employee) { create(:employee) }
  let!(:employee2) { create(:employee) }
  let!(:client) { create(:client) }
  let!(:invoice_group) { create(:invoice_group) }
  
  let!(:invoice1) { create(:invoice, is_finalized: true, location: location, employee: employee, client: client, invoice_group: invoice_group, created_at: Date.today) }
  let!(:invoice2) { create(:invoice, is_finalized: true, location: location, employee: employee, client: client, invoice_group: invoice_group, created_at: Date.today + 1.day) }
  let!(:invoice3) { create(:invoice, is_finalized: true, location: location, employee: employee, client: client, invoice_group: invoice_group, created_at: Date.today + 1.day, mentor_id: employee.id) }

  before do
    allow(controller).to receive(:current_employee).and_return(employee)
  end

  describe 'GET #index' do
    it 'returns paginated invoices' do
      get :index, params: { page: 1 }
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)

      expect(json_response['invoices']).to be_present
      expect(json_response['current_page']).to eq(1)
      expect(json_response['total_entries']).to eq(2)
      expect(json_response['total_pages']).to eq(1)
    end
  end

  describe 'GET #employee_invoices' do
    context 'when employee_id is present' do
      it 'returns the invoices for the specified employee' do
        get :employee_invoices, params: { employee_id: employee.id }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response.size).to eq(3)
        expect(json_response).to all(include('id', 'client_name'))
      end
    end

    context 'when employee_id is not present' do
      it 'returns an empty array' do
        get :employee_invoices, params: { employee_id: nil }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response).to be_empty
      end
    end
  end

  describe 'GET #mentorship_invoices' do
    context 'when is_admin is true' do
      it 'returns all mentorship invoices' do
        get :mentorship_invoices, params: { is_admin: "true" }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response.size).to eq(1)
      end
    end

    context 'when is_admin is false' do
      it 'returns mentorship invoices for the specified employee' do
        get :mentorship_invoices, params: { employee_id: employee2.id, is_admin: "false" }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response).to be_empty
      end
    end
  end

  describe '#summary' do
    context 'with valid date range and location_id' do
      it 'returns the filtered invoices' do
        get :summary, params: { start_date: (Date.today - 1.day).strftime('%Y-%m-%d'), end_date: Date.today.strftime('%Y-%m-%d'), location_id: location.id.to_s }
        
        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body) 
        expect(json_response['data'].size).to eq(1)
      end
    end

    context 'with no invoices matching criteria' do
      it 'returns locations with calculated percentages even with no invoices' do
        get :summary, params: { start_date: (Date.today + 5.days).strftime('%Y-%m-%d'), end_date: (Date.today + 10.days).strftime('%Y-%m-%d'), location_id: location.id.to_s }

        expect(response).to have_http_status(:success)
        json_response = JSON.parse(response.body)
        expect(json_response['data']).not_to be_empty
        expect(json_response['data']).to all(include('location_id', 'location_name', 'percentage_invoiced', 'total_invoiced', 'total_applied'))
      end
    end
  end

  describe 'GET #export_invoices' do
    context 'when valid parameters are provided' do
      it 'exports invoices as an Excel file' do
        allow(controller).to receive(:filtered_invoices_with_date_range).and_return([invoice1, invoice2])
        allow(controller).to receive(:calculate_summary_data).and_return([
          { location_id: location.id, location_name: location.name, total_invoiced: 100, total_applied: 90 }
        ])
        
        package = double('ExcelPackage')
        allow(controller).to receive(:generate_excel_file).and_return(package)
        allow(package).to receive(:to_stream).and_return(StringIO.new("Excel content"))

        get :export_invoices, params: { start_date: Date.today.strftime('%Y-%m-%d'), end_date: (Date.today + 1.day).strftime('%Y-%m-%d'), location_id: location.id.to_s }

        expect(response).to have_http_status(:ok)
        expect(response.headers['Content-Disposition']).to include("attachment; filename=\"invoices_summary_")
        expect(response.headers['Content-Type']).to eq("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      end
    end

    context 'when no invoices are found' do
      it 'still exports an Excel file with no data' do
        allow(controller).to receive(:filtered_invoices_with_date_range).and_return([])
        allow(controller).to receive(:calculate_summary_data).and_return([])

        package = double('ExcelPackage')
        allow(controller).to receive(:generate_excel_file).and_return(package)
        allow(package).to receive(:to_stream).and_return(StringIO.new("No data"))

        get :export_invoices, params: { start_date: Date.today.strftime('%Y-%m-%d'), end_date: (Date.today + 1.day).strftime('%Y-%m-%d'), location_id: location.id.to_s }

        expect(response).to have_http_status(:ok)
        expect(response.headers['Content-Disposition']).to include("attachment; filename=\"invoices_summary_")
        expect(response.headers['Content-Type']).to eq("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      end
    end
  end


  describe 'GET #location_pdf' do
    context 'when location exists' do
      context 'but no invoices exist' do
        it 'returns a pdf' do
          Invoice.where(location: location).destroy_all

          get :location_pdf, params: { location_id: location.id }

          expect(response).to have_http_status(:ok)
          expect(response.content_type).to eq 'application/pdf'
        end
      end
    end

    context 'when location does not exist' do
      it 'returns a not found error' do
        expect {get :location_pdf, params: { location_id: -1 }}.to raise_error(ActiveRecord::RecordNotFound)
      end
    end
  end

  describe 'GET #finalized_invoice' do
    context 'when there are finalized invoices' do
      it 'returns the paginated finalized invoices' do
        get :finalized_invoice, params: { page: 1 } 
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['invoices']).to be_present
        expect(json_response['current_page']).to eq(1)
        expect(json_response['total_entries']).to eq(2)
        expect(json_response['total_pages']).to eq(1) 
      end
    end

    context 'when there are no finalized invoices' do
      before do
        Invoice.destroy_all 
      end

      it 'returns an empty invoices array' do
        get :finalized_invoice, params: { page: 1 }

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['invoices']).to be_empty
        expect(json_response['current_page']).to eq(1)
        expect(json_response['total_entries']).to eq(0)
        expect(json_response['total_pages']).to eq(1)
      end
    end
  end

  describe 'GET #mentors_invoice' do
    context 'when employee_id is present' do
      it 'returns the finalized invoices for the specified employee' do
        get :mentors_invoice, params: { employee_id: employee.id, page: 1 } 

        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)

        expect(json_response['invoices']).to be_present
        expect(json_response['current_page']).to eq(1)
        expect(json_response['total_entries']).to eq(3) 
        expect(json_response['total_pages']).to eq(1) 
      end
    end
  end

  describe '#calculate_summary_data' do
    let!(:invoices) do
      [
        create(:invoice, location_id: location.id, paid_by_client_cash: 100, total_consumable_cost: 50, tip: 10),
        create(:invoice, location_id: location.id, paid_by_client_cash: 200, total_consumable_cost: 30, tip: 20)
      ]
    end

    it 'calculates summary data for all locations' do
      summary_data = controller.send(:calculate_summary_data, invoices)
      expect(summary_data.size).to eq(1)
    end
  end

  describe '#calculate_charge' do
    let!(:invoice) { create(:invoice, paid_by_client_cash: 100, paid_by_client_credit: 100, total_consumable_cost: 50, tip: 10, personal_discount: 5) }

    it 'calculates the correct total payment' do
      total_payment = controller.send(:calculate_charge, invoice)
      expect(total_payment).to eq(191.9)
    end
  end
end

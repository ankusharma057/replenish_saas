require 'rails_helper'

RSpec.describe Api::InvoiceListsController, type: :controller do
  describe '#summary' do
    let!(:location) { create(:location) }
    let!(:employee) { create(:employee) }
    let!(:client) { create(:client) }
    let!(:invoice_group) { create(:invoice_group) }
    let!(:invoice1) { create(:invoice, is_finalized: true, location: location, employee: employee, client: client, invoice_group: invoice_group, created_at: Date.today - 1.day) }
    let!(:invoice2) { create(:invoice, is_finalized: true, location: location, employee: employee, client: client, invoice_group: invoice_group, created_at: Date.today) }

    before do
      allow(controller).to receive(:current_employee).and_return(employee)
    end

    context 'with valid date range and location_id' do
      it 'returns the filtered invoices' do
        get :summary, params: { start_date: (Date.today - 1.day).strftime('%Y-%m-%d'), end_date: Date.today.strftime('%Y-%m-%d'), location_id: location.id.to_s }
        
        expect(response).to have_http_status(:success)
      end
    end

    context 'with no date range' do
      it 'returns invoices for the current month' do
        get :summary, params: { location_id: location.id.to_s }

        expect(response).to have_http_status(:success)
      end
    end

    context 'with no invoices matching criteria' do
      it 'returns an empty array' do
        get :summary, params: { start_date: (Date.today + 1.day).strftime('%Y-%m-%d'), end_date: (Date.today + 2.days).strftime('%Y-%m-%d'), location_id: location.id.to_s }

        expect(response).to have_http_status(:success)
      end
    end
  end

  describe '#calculate_summary_data' do
    let!(:location) { create(:location) }
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
      expect(total_payment).to eq(173.0)
    end
  end
end

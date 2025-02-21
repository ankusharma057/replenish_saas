# frozen_string_literal: true

# rubocop:disable Metrics/ModuleLength
# rubocop:disable Metrics/BlockLength

module PdfDownloadable
  extend ActiveSupport::Concern

  included do
    def get_html(products_hash)
      str = "
        <html lang=\"ko\">
          <head>
            <meta charset=\"UTF-8\">
            <meta content=\"width=device-width, initial-scale=1\" name=\"viewport\">
            <meta name=\"x-apple-disable-message-reformatting\">
            <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
            <style type=\"text/css\">
              html { height: 0; }
              table {
                border-collapse: collapse;
              }
              .page-break { display:block; clear:both; page-break-after:always; }

              .container {
                display: flex;
                justify-content: space-between;
              }
              .left {
                float: left;
              }

              .right {
                float: right;
              }
            </style>
          </head>
          <body>
            <h1 style=\"text-align: center; color: black;\">Replenish Aesthetics and Wellness</h1>
            <div class=\"container\" style=\"color: blue;\">
              <h4 style=\"text-align: left;\">Vendor: #{employee.vendor_name}</h4>
              <br>
              <div style=\"text-align: right;\">Name: #{employee.name}</div>
              <div style=\"text-align: left;\">Email: #{employee.email}</div>
              <div style=\"text-align: right;\">Invoice: #{id}</div>
              <div style=\"text-align: left;\">Charge: $#{charge&.round(2)}</div>
              <div style=\"text-align: right;\">Client Name: #{client&.name}</div>
              <div style=\"text-align: left;\">Date of Service: #{date_of_service}</div>
              <div style=\"text-align: right;\">Concierge Fee Paid: #{concierge_fee_paid ? 'Yes' : 'No'}</div>
              <div style=\"text-align: left;\">GFE: #{gfe ? 'Yes' : 'No'}</div>
              <div style=\"text-align: right;\">Provider Purchased: #{provider_purchased ? 'Yes' : 'No'}</div>
              <div style=\"text-align: left;\">Semaglutide Consultation Fee: #{semag_consult_fee ? 'Yes' : 'No'}</div>
      "

      if old_invoice?
        str += '
                  <div style="text-align: right;">Client Cash: ' + paid_by_client_cash&.round(2).to_s + '</div>
                  <div style="text-align: left;">Client Credit: ' + paid_by_client_credit&.round(2).to_s + '</div>
                  <div style="text-align: right;">Client Paid: ' + (if paid_by_client_cash && paid_by_client_credit
                                                                      paid_by_client_cash.to_f
                                                                      + paid_by_client_credit.to_f
                                                                    end)&.round(2).to_s + '</div>
              '
      end

      str += '
            <div style="text-align: right;">
              Total Amount Client Paid: ' + total_amount_paid_by_client&.round(2).to_s + '
            </div>
            <div style="text-align: left;">  Payment Type: ' + payment_type.to_s + '</div>
            <div style="text-align: right;">  Tip: ' + tip.to_f + '</div>
          </div>

          <div></div>
          <div class="main-table" style="margin: 30px auto;max-width: 800px">
          <div class="page-break">'

      products_hash&.each do |key, value|
        table_str = ''
        table_str += '<hr color="#323aa8">
            <h1 style="margin-bottom: 10px; color: #323aa8">' + key.titleize.to_s + ':</h1>

            <table style="width: 100%; margin: 50px 0">
              <tbody>
                <tr style="line-height: 50px; text-align: center; border-bottom: 2px solid #302726;
                    color: #323aa8; font-size: 22px;">
                  <th width="40%">Product Name</th>
                  <th width="20%">Quantity</th>
                  <th width="20%">Price</th>
                  <th width="20%">Total Price</th>
                </tr>'
        value&.each do |data|
          table_str += '<tr style="line-height: 50px; border-top: 2px solid #302726;
                          text-align: center; padding: 30px 0px; color: #1c1818">
                  <td width="40%">' + data.first.to_s + '</td>
                  <td width="20%">' + data.second.to_s + '</td>
                  <td width="20%">' + data.last.to_s + '</td>
                  <td width="20%">' + (data.second.to_f * data.last.to_f)&.round(2).to_s + '</td>
                </tr>'
        end

        table_str += '<tbody>
          </table>'

        amt_paid_key = :"amt_paid_for_#{key}"
        amt_paid = begin
          binding.local_variable_get(amt_paid_key)
        rescue StandardError
          0.0
        end

        table_str += "
          <div style=\"margin: 20px 0; font-size: 20px; color: #323aa8;\">
            <strong>Amount Paid for #{key.titleize}: $#{amt_paid.nil? ? '0.00' : amt_paid.to_f.round(2)}</strong>
          </div>
        "

        str += table_str
      end
      str += ' </div>
        </body>
      </html>'
    end

    def get_html_finalized(products_hash)
      str = "
        <html lang=\"ko\">
          <head>
            <meta charset=\"UTF-8\">
            <meta content=\"width=device-width, initial-scale=1\" name=\"viewport\">
            <meta name=\"x-apple-disable-message-reformatting\">
            <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">
            <style type=\"text/css\">
              html { height: 0; }
              table {
                border-collapse: collapse;
              }
              .page-break { display:block; clear:both; page-break-after:always; }
              .container {
                display: flex;
                justify-content: space-between;
              }
              .left {
                float: left;
              }
              .right {
                float: right;
              }
            </style>
          </head>
          <body>
            <h1 style=\"text-align: center; color: blue;\">Replenish Aesthetics and Wellness</h1>
            <div class=\"container\" style=\"color: blue;\">
              <h4 style=\"text-align: left;\">Vendor: #{employee.vendor_name}</h4>
              <br>
              <div style=\"text-align: right;\">Name: #{employee.name}</div>
              <div style=\"text-align: left;\">Email: #{employee.email}</div>
              <div style=\"text-align: right;\">Invoice: #{id}</div>
              <div style=\"text-align: left;\">Charge: #{charge&.round(2)}</div>
              <div style=\"text-align: right;\">Client Name: #{client&.name}</div>
              <div style=\"text-align: left;\">Date of Service: #{date_of_service}</div>
              <div style=\"text-align: right;\">Concierge Fee Paid: #{concierge_fee_paid ? 'Yes' : 'No'}</div>
              <div style=\"text-align: left;\">GFE: #{gfe ? 'Yes' : 'No'}</div>
              <div style=\"text-align: right;\">Provider Purchased: #{provider_purchased ? 'Yes' : 'No'}</div>
              <div style=\"text-align: left;\">Semaglutide Consultation Fee: #{semag_consult_fee ? 'Yes' : 'No'}</div>
      "

      if old_invoice?
        str += '
          <div style="text-align: right;">
            Client Cash: ' + paid_by_client_cash&.round(2).to_s + '
          </div>
          <div style="text-align: left;">
            Client Credit: ' + paid_by_client_credit&.round(2).to_s + '
          </div>
          <div style="text-align: right;">
            Client Paid: ' + (
              paid_by_client_cash.to_f + paid_by_client_credit.to_f if paid_by_client_cash && paid_by_client_credit
            )&.round(2).to_s + '
          </div>
        '
      end

      str += '
            <div style="text-align: right;">
              Total Amount Client Paid: ' + total_amount_paid_by_client&.round(2).to_s + '
            </div>
            <div style="text-align: left;">  Payment Type: ' + payment_type.to_s + '</div>
            <div style="text-align: right;">  Tip: ' + tip.to_s + '</div>
            <div style="text-align: left;">  Overhead Fee Type: ' + overhead_fee_type&.capitalize.to_s + '</div>
            <div style="text-align: right;">  Overhead Fee Value: ' + overhead_fee_value.to_s + '</div>
          </div>

          <div></div>
          <div class="main-table" style="margin: 30px auto;max-width: 800px">
          <div class="page-break">'

      products_hash&.each do |key, value|
        table_str = ''
        table_str += '<hr color="#323aa8">
            <h1 style="margin-bottom: 10px; color: #323aa8">' + key.titleize.to_s + ':</h1>

            <table style="width: 100%;margin: 50px 0">
              <tbody>
              <tr style="line-height: 50px; text-align: center;
                border-bottom: 2px solid #302726; color: #323aa8;
                font-size: 22px;">
                  <th width="40%">Product Name</th>
                  <th width="20%">Quantity</th>
                  <th width="20%">Price</th>
                  <th width="20%">Total Price</th>
                </tr>'
        value&.each do |data|
          table_str += '<tr style="line-height: 50px; border-top: 2px solid #302726;
                          text-align: center; padding: 30px 0px; color: #1c1818">
                  <td width="40%">' + data.first.to_s + '</td>
                  <td width="20%">' + data.second.to_s + '</td>
                  <td width="20%">' + data.last.to_s + '</td>
                  <td width="20%">' + (data.second.to_f * data.last.to_f)&.round(2).to_s + '</td>
                </tr>'
        end

        table_str += '<tbody>
          </table>'

        amt_paid_key = :"amt_paid_for_#{key}"
        amt_paid = begin
          binding.local_variable_get(amt_paid_key)
        rescue StandardError
          0.0
        end

        table_str += "
          <div style=\"margin: 20px 0; font-size: 20px; color: #323aa8;\">
            <strong>Amount Paid for #{key.titleize}: $#{amt_paid.nil? ? '0.00' : amt_paid.to_f.round(2)}</strong>
          </div>
        "

        str += table_str
      end
      str += ' </div>
        </body>
      </html>'
    end

    def old_invoice?
      amt_paid_for_mp_products.nil? &&
        amt_paid_for_products.nil? &&
        amt_paid_for_retail_products.nil? &&
        amt_paid_for_wellness_products.nil?
    end

    def total_amount_paid_by_client
      amt_paid_for_products.to_f +
        amt_paid_for_retail_products.to_f +
        amt_paid_for_wellness_products.to_f +
        amt_paid_for_mp_products.to_f
    end
  end
end

# rubocop:enable Metrics/ModuleLength
# rubocop:enable Metrics/BlockLength

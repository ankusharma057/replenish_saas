# frozen_string_literal: true

module PdfGroupDownloadable
  extend ActiveSupport::Concern

  included do
    def get_html_for_group
      str = '<html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta content="width=device-width, initial-scale=1" name="viewport">
          <meta name="x-apple-disable-message-reformatting">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <style type="text/css">
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
          <h1 style="text-align: center; color: black;"> Replenish Aesthetics and Wellness</h1>'
      str += "<h3>Bill Amount: #{source_invoices.pluck(:charge).reject{|charge| charge.nil?}.inject(:+)}</h3>"


      source_invoices.each do |invoice| 
        complete_table_str = ''
        complete_table_str += '<div class="container" style="color: blue;">
                  <h3 style="text-align: left;">  Vendor Name: '"#{invoice.employee.vendor_name}"'  </h3> 
                  <br>
                  <div style="text-align: right;">  Name: '"#{invoice.employee.name}"'  </div>

                  <div style="text-align: left;">  Email: '"#{invoice.employee.email}"'  </div>
                  <div style="text-align: right;"> Invoice: '"#{invoice.id}"' </div>  

                  <div style="text-align: left;"> Charge: '"#{invoice.charge&.round(2)}"' </div>
                  <div style="text-align: right;">  Client Name: '"#{invoice.client&.name}"' </div>  

                  <div style="text-align: left;">  Date of Service: '"#{invoice.date_of_service}"' </div> 
                  <div style="text-align: right;">  Concierge Fee Paid: '"#{invoice.concierge_fee_paid ? 'Yes' : 'No'}"'</div>  

                  <div style="text-align: left;">  GFE: '"#{invoice.gfe ? 'Yes' : 'No'}"'</div>  
                  <div style="text-align: right;">  Provider Purchased: '"#{invoice.provider_purchased ? 'Yes' : 'No'}"'</div>  

                  <div style="text-align: left;">  Semaglutide Consultation Fee: '"#{invoice.semag_consult_fee ? 'Yes' : 'No'}"'</div>  
                  <div style="text-align: right;">  Client Cash: '"#{invoice.paid_by_client_cash&.round(2)}"'</div>  

                  <div style="text-align: left;">  Client Credit: '"#{invoice.paid_by_client_credit&.round(2)}"'</div>  
                  <div style="text-align: right;">  Client Paid: '"#{(invoice.paid_by_client_cash.to_f + invoice.paid_by_client_credit.to_f if (invoice.paid_by_client_cash && invoice.paid_by_client_credit))&.round(2)}"'</div>  

                  <div style="text-align: left;">  Personal Discount: '"#{invoice.personal_discount}"'</div>
                  <div style="text-align: right;">  Tip: '"#{invoice.tip}"'</div>
                </div>

                <div></div>
                <div class="main-table" style="margin: 30px auto;max-width: 800px">
                <div class="page-break">'

                invoice.products_hash&.each do |key, value|
                  table_str = ""
                  table_str += '<hr color="#323aa8">
                    <h1 style="margin-bottom: 10px; color: #323aa8">'"#{key.titleize}"':</h1>

                    <table style="width: 100%;margin: 50px 0">
                      <tbody>
                        <tr style="line-height: 50px; text-align: center; border-buttom: 2px solid #302726; color: #323aa8; font-size: 22px;">
                          <th width="40%">Product Name</th>
                          <th width="20%">Quantity</th>
                          <th width="20%">Price</th>
                          <th width="20%">Total Price</th>
                        </tr>'
                  value&.each do |data|
                    table_str += '<tr style="line-height: 50px; border-top: 2px solid #302726; text-align: center; padding: 30px 0px; color: #1c1818">
                          <td width="40%">'"#{data.first}"'</td>
                          <td width="20%">'"#{data.second}"'</td>
                          <td width="20%">'"#{data.last}"'</td>
                          <td width="20%">'"#{(data.second.to_f * data.last.to_f)&.round(2)}"'</td>
                        </tr>'
                  end

                  table_str += '<tbody>
                  </table>'

                  complete_table_str += table_str
                end
            complete_table_str +=  ' </div>
                                      </body>
                                    </html>'
            str += complete_table_str
          end
        str
      end

    def get_html_for_group_finalized
      str = '<html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta content="width=device-width, initial-scale=1" name="viewport">
          <meta name="x-apple-disable-message-reformatting">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <style type="text/css">
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
          <h1 style="text-align: center; color: black;"> Replenish Aesthetics and Wellness</h1>'
      str += "<h2>Bill Amount: #{source_invoices.pluck(:charge).reject{|charge| charge.nil?}.inject(:+)}</h2>"

      source_invoices.includes(:employee, :client).each do |invoice|
        complete_table_str = ''
        complete_table_str += '<div class="container" style="color: blue;">
                <h3 style="text-align: left;">  Vendor Name: '"#{invoice.employee.vendor_name}"'  </h3> 
                <br>
                <div style="text-align: right;">  Name: '"#{invoice.employee.name}"'  </div>

                <div style="text-align: left;">  Email: '"#{invoice.employee.email}"'  </div>
                <div style="text-align: right;"> Invoice: '"#{invoice.id}"' </div>  
                
                <div style="text-align: left;"> Charge: '"#{invoice.charge&.round(2)}"' </div>
                <div style="text-align: right;">  Client Name: '"#{invoice.client&.name}"' </div>  

                <div style="text-align: left;">  Date of Service: '"#{invoice.date_of_service}"' </div> 
                <div style="text-align: right;">  Concierge Fee Paid: '"#{invoice.concierge_fee_paid ? 'Yes' : 'No'}"'</div>  

                <div style="text-align: left;">  GFE: '"#{invoice.gfe ? 'Yes' : 'No'}"'</div>  
                <div style="text-align: right;">  Provider Purchased: '"#{invoice.provider_purchased ? 'Yes' : 'No'}"'</div>

                <div style="text-align: left;">  Semaglutide Consultation Fee: '"#{invoice.semag_consult_fee ? 'Yes' : 'No'}"'</div>  
                <div style="text-align: right;">  Client Cash: '"#{invoice.paid_by_client_cash&.round(2)}"'</div>  

                <div style="text-align: left;">  Client Credit: '"#{invoice.paid_by_client_credit&.round(2)}"'</div>  
                <div style="text-align: right;">  Client Paid: '"#{(invoice.paid_by_client_cash.to_f + invoice.paid_by_client_credit.to_f if (invoice.paid_by_client_cash && invoice.paid_by_client_credit))&.round(2)}"'</div>  

                <div style="text-align: left;">  Personal Discount: '"#{invoice.personal_discount}"'</div>
                <div style="text-align: right;">  Tip: '"#{invoice.tip}"'</div>

                <div style="text-align: left;">  Overhead Fee Type: '"#{invoice.overhead_fee_type&.capitalize}"'</div>
                <div style="text-align: right;">  Overhead Fee Value: '"#{invoice.overhead_fee_value}"'</di>
              </div>

              <div></div>
              <div class="main-table" style="margin: 30px auto;max-width: 800px">
              <div class="page-break">'

              invoice.products_hash&.each do |key, value|
                table_str = ""
                table_str += '<hr color="#323aa8">
                  <h1 style="margin-bottom: 10px; color: #323aa8">'"#{key.titleize}"':</h1>

                  <table style="width: 100%;margin: 50px 0">
                    <tbody>
                      <tr style="line-height: 50px; text-align: center; border-buttom: 2px solid #302726; color: #323aa8; font-size: 22px;">
                        <th width="40%">Product Name</th>
                        <th width="20%">Quantity</th>
                        <th width="20%">Price</th>
                        <th width="20%">Total Price</th>
                      </tr>'
                value&.each do |data|
                  table_str += '<tr style="line-height: 50px; border-top: 2px solid #302726; text-align: center; padding: 30px 0px; color: #1c1818">
                        <td width="40%">'"#{data.first}"'</td>
                        <td width="20%">'"#{data.second}"'</td>
                        <td width="20%">'"#{data.last}"'</td>
                        <td width="20%">'"#{(data.second.to_f * data.last.to_f)&.round(2)}"'</td>
                      </tr>'
                end

                table_str += '<tbody>
                </table>'

                complete_table_str += table_str
              end
          complete_table_str +=  ' </div>
                                    </body>
                                  </html>'
          str += complete_table_str
        end
      str
    end
  end
end

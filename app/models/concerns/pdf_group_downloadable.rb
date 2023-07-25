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
      str += "<h3>Bill Amount: #{invoices.pluck(:charge).reject{|charge| charge.nil?}.inject(:+)}</h3>"


      invoices.each do |invoice| 
        complete_table_str = ''
        complete_table_str += '<div class="container" style="color: blue;">
                  <h2 style="text-align: left;">  Vendor: '"#{invoice.employee.name}"'  </h2> 
                  <div style="text-align: right;">  Email: '"#{invoice.employee.email}"'  </div>

                  <div style="text-align: left;"> Invoice: '"#{invoice.id}"' </div>  
                  <div style="text-align: right;"> Charge: '"#{invoice.charge}"' </div>

                  <div style="text-align: left;">  Client Name: '"#{invoice.client.name}"' </div>  
                  <div style="text-align: right;">  Date of Service: '"#{invoice.date_of_service}"' </div> 

                  <div style="text-align: left;">  Concierge Fee Paid: '"#{invoice.concierge_fee_paid ? 'Yes' : 'No'}"'</div>  
                  <div style="text-align: right;">  GFE: '"#{invoice.gfe ? 'Yes' : 'No'}"'</div>  

                  <div style="text-align: left;">  Client Cash: '"#{invoice.paid_by_client_cash}"'</div>  
                  <div style="text-align: right;">  Client Credit: '"#{invoice.paid_by_client_credit}"'</div>  

                  <div style="text-align: left;">  Client Paid: '"#{invoice.paid_by_client_cash.to_f + invoice.paid_by_client_credit.to_f if (invoice.paid_by_client_cash && invoice.paid_by_client_credit)}"'</div>  
                  <div style="text-align: right;">  Personal Discount: '"#{invoice.personal_discount}"'</div>
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
                          <td width="20%">'"#{(data.second.to_f * data.last.to_f)}"'</td>
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
      str += "<h2>Bill Amount: #{invoices.pluck(:charge).reject{|charge| charge.nil?}.inject(:+)}</h2>"

      invoices.each do |invoice| 
        complete_table_str = ''
        complete_table_str += '<div class="container" style="color: blue;">
                <h2 style="text-align: left;">  Vendor: '"#{invoice.employee.name}"'  </h2> 
                <div style="text-align: right;">  Email: '"#{invoice.employee.email}"'  </div>

                <div style="text-align: left;"> Invoice: '"#{invoice.id}"' </div>  
                <div style="text-align: right;"> Charge: '"#{invoice.charge}"' </div>

                <div style="text-align: left;">  Client Name: '"#{invoice.client.name}"' </div>  
                <div style="text-align: right;">  Date of Service: '"#{invoice.date_of_service}"' </div> 

                <div style="text-align: left;">  Concierge Fee Paid: '"#{invoice.concierge_fee_paid ? 'Yes' : 'No'}"'</div>  
                <div style="text-align: right;">  GFE: '"#{invoice.gfe ? 'Yes' : 'No'}"'</div>  

                <div style="text-align: left;">  Client Cash: '"#{invoice.paid_by_client_cash}"'</div>  
                <div style="text-align: right;">  Client Credit: '"#{invoice.paid_by_client_credit}"'</div>  

                <div style="text-align: left;">  Client Paid: '"#{invoice.paid_by_client_cash.to_f + invoice.paid_by_client_credit.to_f if (invoice.paid_by_client_cash && invoice.paid_by_client_credit)}"'</div>  
                <div style="text-align: right;">  Personal Discount: '"#{invoice.personal_discount}"'</div>

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
                        <td width="20%">'"#{(data.second.to_f * data.last.to_f)}"'</td>
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

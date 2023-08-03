# frozen_string_literal: true

module PdfDownloadable
  extend ActiveSupport::Concern

  included do
    def get_html(products_hash)
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
          <h1 style="text-align: center; color: black;"> Replenish Aesthetics and Wellness</h1>
          <div class="container" style="color: blue;">
            <h4 style="text-align: left;">  Vendor: '"#{employee.vendor_name}"'  </h4> 
            <br>
            <div style="text-align: right;">  Name: '"#{employee.name}"'  </div> 
            <div style="text-align: left;">  Email: '"#{employee.email}"'  </div>

            <div style="text-align: right;"> Invoice: '"#{id}"' </div>  
            <div style="text-align: left;"> Charge: '"#{charge.round(2)}"' </div>

            <div style="text-align: right;">  Client Name: '"#{client.name}"' </div>  
            <div style="text-align: left;">  Date of Service: '"#{date_of_service}"' </div> 

            <div style="text-align: right;">  Concierge Fee Paid: '"#{concierge_fee_paid ? 'Yes' : 'No'}"'</div>  
            <div style="text-align: left;">  GFE: '"#{gfe ? 'Yes' : 'No'}"'</div>  

            <div style="text-align: right;">  Semaglitude Consultation Fee: '"#{semag_consult_fee ? 'Yes' : 'No'}"'</div>  
            <div style="text-align: left;">  Client Cash: '"#{paid_by_client_cash}"'</div>  

            <div style="text-align: right;">  Client Credit: '"#{paid_by_client_credit}"'</div>  
            <div style="text-align: left;">  Client Paid: '"#{(paid_by_client_cash.to_f + paid_by_client_credit.to_f if (paid_by_client_cash && paid_by_client_credit)).round(2)}"'</div>  

            <div style="text-align: right;">  Personal Discount: '"#{personal_discount}"'</div>
            <div style="text-align: left;">  Tip: '"#{tip}"'</div>

          </div>

          <div></div>
          <div class="main-table" style="margin: 30px auto;max-width: 800px">
          <div class="page-break">'

        products_hash&.each do |key, value|
          table_str = ""
          table_str += '<hr color="#323aa8">
            <h1 style="margin-bottom: 10px; color: #323aa8">'"#{key.titleize}"':</h1>

            <table style="width: 100%; margin: 50px 0">
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

          str += table_str
        end
          str +=  ' </div>
        </body>
      </html>'
    end

    def get_html_finalized(products_hash)
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
          <h1 style="text-align: center; color: blue;"> Replenish Aesthetics and Wellness</h1>
          <div class="container" style="color: blue;">
            <h4 style="text-align: left;">  Vendor: '"#{employee.vendor_name}"'  </h4> 
            <br>
            <div style="text-align: right;">  Name: '"#{employee.name}"'  </div>

            <div style="text-align: left;">  Email: '"#{employee.email}"'  </div>

            <div style="text-align: right;"> Invoice: '"#{id}"' </div>  
            <div style="text-align: left;"> Charge: '"#{charge.round(2)}"' </div>

            <div style="text-align: right;">  Client Name: '"#{client.name}"' </div>  
            <div style="text-align: left;">  Date of Service: '"#{date_of_service}"' </div> 

            <div style="text-align: right;">  Concierge Fee Paid: '"#{concierge_fee_paid ? 'Yes' : 'No'}"'</div>  
            <div style="text-align: left;">  GFE: '"#{gfe ? 'Yes' : 'No'}"'</div>  

            <div style="text-align: right;">  Semaglitude Consultation Fee: '"#{semag_consult_fee ? 'Yes' : 'No'}"'</div>  
            <div style="text-align: left;">  Client Cash: '"#{paid_by_client_cash}"'</div>

            <div style="text-align: right;">  Client Credit: '"#{paid_by_client_credit}"'</div>  
            <div style="text-align: left;">  Client Paid: '"#{(paid_by_client_cash.to_f + paid_by_client_credit.to_f if (paid_by_client_cash && paid_by_client_credit)).round(2)}"'</div>  

            <div style="text-align: right;">  Personal Discount: '"#{personal_discount}"'</div>
            <div style="text-align: left;">  Tip: '"#{tip}"'</div>

            <div style="text-align: right;">  Overhead Fee Type: '"#{overhead_fee_type&.capitalize}"'</div>
            <div style="text-align: left;">  Overhead Fee Value: '"#{overhead_fee_value}"'</div>
          </div>

          <div></div>
          <div class="main-table" style="margin: 30px auto;max-width: 800px">
          <div class="page-break">'

        products_hash&.each do |key, value|
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

          str += table_str
        end
          str +=  ' </div>
        </body>
      </html>'
    end
  end
end

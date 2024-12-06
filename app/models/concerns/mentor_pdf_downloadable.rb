# frozen_string_literal: true

module MentorPdfDownloadable
  extend ActiveSupport::Concern

  included do
    def get_mentor_html_for_group
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
      str += "<h3>Bill Amount: #{mentor_invoices.pluck(:charge).reject{|charge| charge.nil?}.inject(:+)}</h3>"


      mentor_invoices.each do |invoice| 
        complete_table_str = ''
        complete_table_str += '<div class="container" style="color: blue;">
                  <h3 style="text-align: left;">  Vendor Name: '"#{invoice.employee&.vendor_name}"'  </h3> 
                  <br>
                  <div style="text-align: right;">  Mentor: '"#{invoice.employee&.name}"'  </div>

                  <div style="text-align: right;">  Mentee: '"#{invoice.source_invoice.employee&.name}"'  </div>

                  <div style="text-align: left;">  Email: '"#{invoice.employee.email}"'  </div>

                  <div style="text-align: right;"> Invoice: '"#{invoice.id}"' </div>  
                  <div style="text-align: left;"> Charge: '"#{invoice.charge&.round(2)}"' </div>

                  <div style="text-align: right;">  Client Name: '"#{invoice.client&.name}"' </div>  
                  <div style="text-align: left;">  Date of Service: '"#{invoice.date_of_service}"' </div> 

                </div>

                <div></div>
                <div class="main-table" style="margin: 30px auto;max-width: 800px">
                <div class="page-break">'
            complete_table_str +=  ' </div>
                                      </body>
                                    </html>'
            str += complete_table_str
          end
        str
      end

    def get_mentor_html_for_group_finalized
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
      str += "<h2>Bill Amount: #{mentor_invoices.pluck(:charge).reject{|charge| charge.nil?}.inject(:+)}</h2>"

      mentor_invoices.each do |invoice| 
        complete_table_str = ''
        complete_table_str += '<div class="container" style="color: blue;">
                <h3 style="text-align: left;">  Vendor Name: '"#{invoice.employee&.vendor_name}"'  </h3> 
                <br>
                <div style="text-align: right;">  Mentor: '"#{invoice.employee&.name}"'  </div>

                <div style="text-align: right;">  Mentee: '"#{invoice.source_invoice.employee&.name}"'  </div>

                <div style="text-align: left;">  Email: '"#{invoice.employee.email}"'  </div>

                <div style="text-align: right;"> Invoice: '"#{invoice.id}"' </div>  
                <div style="text-align: left;"> Charge: '"#{invoice.charge&.round(2)}"' </div>

                <div style="text-align: right;">  Client Name: '"#{invoice.client&.name}"' </div>  
                <div style="text-align: left;">  Date of Service: '"#{invoice.date_of_service}"' </div> 

              </div>

              <div></div>
              <div class="main-table" style="margin: 30px auto;max-width: 800px">
              <div class="page-break">'
          complete_table_str +=  ' </div>
                                    </body>
                                  </html>'
          str += complete_table_str
        end
      str
    end
  end
end

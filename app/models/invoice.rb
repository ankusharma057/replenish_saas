class Invoice < ApplicationRecord
  require 'prawn-html'
  require 'wicked_pdf'

  belongs_to :employee
  belongs_to :client
  has_many :products_invoices, class_name: 'ProductInvoice'
  has_many :products, through: :products_invoices
  has_one_attached :document, dependent: :purge

  validates_presence_of :overhead_fee_type, on: :update, if: lambda{ |invoice| invoice.overhead_fee_value.present? }

  before_update :revise_charge
  before_destroy :return_inventory

  scope :finalized, -> { where(is_finalized: true) }
  scope :non_finalized, -> { where(is_finalized: false) }

  def save_pdf_and_send_mail(products, retail_products)
    # TODO: Refactor the duplicate code to generate the pdf in this and the later method (before the overhead section) 
    products_hash["products"] = products
    products_hash["retail_products"] = retail_products
    
    if products_hash && products_hash.any?
      products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
        emp_product_quantity = employee.employees_inventories.where(product: Product.find_by(name: product_quantity.keys.first)).first
        emp_product_quantity.update(quantity: (emp_product_quantity.quantity - product_quantity.values.first.to_i))
      end
    end

    pdf = WickedPdf.new.pdf_from_string(get_html(products_hash))
    File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
      file << pdf
    end

    document.attach(io: File.open("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Non-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    save!

    SendNotificationPdfToAdminsMailer.with(invoice: self).send_mail.deliver
    File.delete("public/#{employee.name}-Non-Finalized-Invoice-#{id}.pdf")
  end

  def finalize_and_send_pdf_mail
    products_hash["Products"] = products_hash["products"]
    products_hash["Retail Products"] = products_hash["retail_products"]
    products_hash.except!("products", "retail_products")

    pdf = WickedPdf.new.pdf_from_string(get_html(products_hash, overhead_table_data: true))
    File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf", 'wb') do |file|
      file << pdf
    end

    document.purge # To remove the non-finalized document
    document.attach(io: File.open("public/#{employee.name}-Finalized-Invoice-#{id}.pdf"), filename: "#{employee.name}-Finalized-Invoice-#{id}.pdf", content_type: "application/pdf")

    update!(is_finalized: true)
    SendPdfToInvoiceMailer.with(invoice: self).send_mail.deliver
  end

  def reject_and_send_mail(feedback)
    if RejectInvoiceMailer.with(invoice: self, feedback: feedback).send_mail.deliver
      destroy!
    end
  end

  private
  def revise_charge
    if (overhead_fee_type && overhead_fee_type_changed?) || (overhead_fee_value && overhead_fee_value_changed?)
      self.charge -=  case overhead_fee_type
                      when "percentage"
                        (charge*overhead_fee_value/100)
                      when "fixed"
                        overhead_fee_value
                      end.round(2)
    end
  end

  def return_inventory
    if products_hash && products_hash.any?
      products_hash.values.flatten(1).map {|arr| {arr[0] => arr[1]}}.each do |product_quantity|
        emp_product_quantity = employee.employees_inventories.find_or_create_by(product: Product.find_by(name: product_quantity.keys.first))
        emp_product_quantity.update!(quantity: (emp_product_quantity.quantity.to_i + product_quantity.values.first.to_i))
      end
    end
  end

  def get_html(products_hash, overhead_table_data: false)
    products_hash = products_hash.reject{|hash| products_hash[hash].blank? }

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
        <div class="container" style="color: blue;">
          <div style="text-align: left;"> Invoice: '"#{id}"' </div>  
          <div style="text-align: right;"> Charge: '"#{charge}"' </div>  
          <div style="text-align: left;">  Provider: '"#{employee.name}"'  </div> 

          <div style="text-align: right;">  Client Name: '"#{client.name}"' </div>  
          <div style="text-align: left;">  Date of Service: '"#{date_of_service}"' </div> 

          <div style="text-align: right;">  Concierge Fee Paid: '"#{concierge_fee_paid ? 'Yes' : 'No'}"'</div>  
          <div style="text-align: left;">  GFE: '"#{gfe ? 'Yes' : 'No'}"'</div>  

          <div style="text-align: right;">  Paid By Client Cash: '"#{paid_by_client_cash}"'</div>  
          <div style="text-align: left;">  Paid By Client Credit: '"#{paid_by_client_credit}"'</div>  

          <div style="text-align: right;">  Total Paid by Credit: '"#{paid_by_client_cash.to_i + paid_by_client_credit.to_i if (paid_by_client_cash && paid_by_client_credit)}"'</div>  
          <div style="text-align: left;">  Personal Discount: '"#{personal_discount}"'</div>
        </div>

        <div></div>
        <div class="main-table" style="margin: 30px auto;max-width: 800px">
        <div class="page-break">'

      products_hash&.each do |key, value|
        table_str = ""
        table_str += '<hr color="#323aa8">
          <h1 style="margin-bottom: 10px; color: #323aa8">'"#{key}"':</h1>

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
                <td width="20%">'"#{(data.second.to_i * data.last.to_i)}"'</td>
              </tr>'
        end

        table_str += '<tbody>
        </table>'

        if overhead_table_data
          str += '<h1 style1="color: #323aa8""> Overhead: </h1>
            <h3> "Fee Type: </h3>   #{overhead_fee_type&.capitalize}"</div>
            <hr color="#323aa8">
            <h3>Fee Value: </h3>    #{overhead_fee_value}"</div>
          '
        end

        str += table_str
      end
        str +=  ' </div>
      </body>
    </html>'
  end
end

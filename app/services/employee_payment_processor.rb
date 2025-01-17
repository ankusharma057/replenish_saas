class EmployeePaymentProcessor
  def self.process_scheduled_payments
    Rails.logger.info "Starting scheduled payment processing"
    payments = ScheduledPayment.where("DATE(scheduled_at) = ?", Date.current)

    if payments.empty?
      Rails.logger.info "No payments scheduled for today"
      return
    end

    payments.each do |payment|
      Rails.logger.info "Processing payment ID: #{payment.id}"
      process_payment(payment.employee_id, payment.invoice_id, payment.total_amount)
      payment.destroy
      Rails.logger.info "Payment ID: #{payment.id} processed and removed from the queue"
    end
  rescue => e
    Rails.logger.error "Error during scheduled payment processing: #{e.message}"
  end


  def self.process_payment(employee_id, invoice_id, total_amount)
    employee = Employee.find(employee_id)
    invoice = Invoice.find(invoice_id)

    begin
      account = Stripe::Account.retrieve(employee.stripe_account_id)

      if account.external_accounts.data.empty?
        Rails.logger.error "Employee #{employee_id} does not have a bank account linked to Stripe"
        return
      end

      external_account_id = account.external_accounts.data.first.id
      payout = Stripe::Payout.create(
        {
          amount: total_amount,
          currency: 'usd',
          destination: external_account_id,
          method: 'instant',
          description: 'Payment for services rendered',
          metadata: { invoice_id: invoice.id }
        },
        { stripe_account: account.id }
      )

      Rails.logger.info "Payment sent successfully for Employee #{employee_id}, Invoice #{invoice_id}, Payout ID: #{payout.id}"

      invoice.update(is_paid: 'true')

    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe error for Employee #{employee_id}, Invoice #{invoice_id}: #{e.message}"
    end
  end
end

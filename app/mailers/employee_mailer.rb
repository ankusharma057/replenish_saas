class EmployeeMailer < ApplicationMailer

  def notify_missing_bank_account(employee)
    @employee = employee
    mail(
      to: @employee.email,
      subject: 'Reminder: Add Your Bank Account to Stripe'
    )
  end


  def payment_initiated(employee, invoice)
  	@employee = employee
  	@invoice = invoice
  	mail(
  		to: @employee.email,
  		subject: "Payment Initiated successfully"
  	)
  end

  def scheduled_payment_notification(employee, invoice, total_amount)
  	@employee = Employee.find(employee)
  	@invoice = Invoice.find(invoice)
  	@amount = total_amount
    mail(
  		to: @employee.email,
  		subject: "Payment Initiated successfully"
  	)
  end

  def payment_failed(employee, invoice)
  	@employee = employee
  	@invoice = invoice
  	mail(
  		to: @employee.email,
  		subject: "Payment failed due to account verification is pending"
  	)
  end


  def onboard_to_stripe(employee)
    @employee = employee
    mail(
      to: @employee.email,
      subject: 'Reminder: On-board to Stripe'
    )
  end
end

class Inventory < ApplicationRecord
  self.table_name = 'inventories'

  belongs_to :product
  has_many :inventory_requests, dependent: :destroy
  
  def prompt_to_employee(employee, quantity)
    update!(quantity: self.quantity.to_f - quantity.to_f)
    employee.inventory_prompts.create!(
      product: self.product,
      quantity: quantity.to_f
    )
  end

  def request_for_inventory_and_send_mail(requestor_employee, quantity_asked, date_of_use)
    inventory_request = inventory_requests.create!(
      requestor: requestor_employee,
      quantity_asked: quantity_asked,
      date_of_use: date_of_use
    )

    SendInventoryRequestNotificationMailer.with(inventory_request: inventory_request).send_notification.deliver_now
  end

  # private

  # def notify_when_inventory_is_create_updated_or_deleted
  #   text = "The Inventory for #{product.name} has been"
  #   action_prompt = if new_record?
  #       "created."
  #     elsif quantity_changed?
  #       "updated to quantity: #{quantity}."
  #     else
  #       "deleted."
  #     end

  #   send_message (text + action_prompt)
  # end
end

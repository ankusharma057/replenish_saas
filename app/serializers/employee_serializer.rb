# frozen_string_literal: true

# rubocop:disable Rails/InverseOf
class EmployeeSerializer < ActiveModel::Serializer
  attributes :id, :name, :vendor_name, :email, :password, :gfe,
             :service_percentage, :retail_percentage, :wellness_percentage, :pay_50, :inventory_prompts,
             :employees_inventories, :has_access_only_to, :pending_requests, :reference_number,
             :is_admin, :is_inv_manager, :is_mentor, :employee_mentors, :employee_locations, :profile_photo_url,
             :plan, :stripe_customer_id, :stripe_account_id, :instant_pay

  has_many :invoices
  has_many :inventory_prompts, class_name: 'InventoryPrompt'
  has_many :inventory_requests, class_name: 'InventoryRequest', foreign_key: :requestor_id
  has_many :employees_inventories, class_name: 'EmployeeInventory'
  has_many :employee_mentors, class_name: 'EmployeeMentor'
  has_many :employee_locations, class_name: 'EmployeeLocation'

  # def employees_inventories
  #   object.employees_inventories&.map do |employee_inventory|
  #     EmployeeInventorySerializer.new(employee_inventory).attributes
  #   end
  # end

  # def inventory_prompts
  #   object.inventory_prompts&.map do |inventory_prompt|
  #     InventoryPromptSerializer.new(inventory_prompt).attributes
  #   end
  # end

  delegate :roles, to: :object

  def pending_requests
    object.inventory_requests.where.not(is_approved: true)
  end

  def is_admin
    object.is_admin?
  end

  def is_inv_manager
    object.is_inv_manager?
  end

  def is_mentor
    object.is_mentor?
  end

  def profile_photo_url
    return unless object.profile_photo.attached?

    Rails.application.routes.url_helpers.rails_blob_url(object.profile_photo, only_path: true)
  end
end
# rubocop:enable Rails/InverseOf

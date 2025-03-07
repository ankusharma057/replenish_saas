class Client < ApplicationRecord
  has_secure_password validations: false
  has_many :invoices, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :employee_clients, dependent: :destroy
  has_many :employees, through: :employee_clients
  has_many :response_intake_forms, dependent: :destroy
  has_many :chart_entries, dependent: :destroy
  has_many :file_uploads, dependent: :destroy
  has_one :client_detail, dependent: :destroy
  has_one_attached :profile_photo
  belongs_to :referred_employee, class_name: 'Employee', optional: true


  accepts_nested_attributes_for :client_detail, update_only: true

  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: 'Email Not valid' }, allow_nil: true
  validates :email, uniqueness: { message: 'Email already taken' }, allow_nil: true
  validates :name, presence: true
  validates :last_name, presence: true
  validates :email, presence: true

  after_create :send_invitation_and_temp_password, if: -> { email.present? }
  after_initialize :set_defaults
  before_save :clear_temp_password_if_activated


  def send_invitation_and_temp_password
    InvitationMailer.with(client: self).client_invitation.deliver_now
    send_client_reset_password_mail
  end

  def send_client_reset_password_mail
    rand_str = 5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("")
    update!(temp_password: "#{rand_str}".gsub(/\s+/, ""))

    SendClientResetPasswordLinkMailer.with(client: self).reset_password_mail.deliver_now
  end

  def email_valid?(new_email)
    if email == new_email
      errors.add(:email, "New email can't be the same as the existing email")
      false
    elsif Client.where.not(id: id).exists?(email: new_email)
      errors.add(:email, "Email is already taken")
      false
    else
      true
    end
  end

  def files_with_descriptions
    file_uploads.map do |file|
      {
        file_name: file.filename.to_s,
        file_url: Rails.application.routes.url_helpers.rails_blob_url(file, only_path: true),
        description: file.metadata[:description]
      }
    end
  end

  private


  def set_defaults
    set_default_notification_settings
    set_booking_policy
    set_booking_payment_policy
  end

  def set_default_notification_settings
    self.notification_settings ||= {
      email_reminder_2_days: false,
      sms_reminder_2_days: false,
      sms_reminder_24_hours: false,
      email_new_cancelled: false,
      email_waitlist_openings: false,
      sms_waitlist_openings: false,
      ok_to_send_marketing_emails: false,
      send_ratings_emails: false,
      do_not_email: false
    }
  end

  def set_booking_policy
    self.online_booking_policy ||= {
      online_booking_allowed: true,
      online_booking_disabled: false
    }
  end

  def set_booking_payment_policy
    self.online_booking_payment_policy ||= {
      no_payment_reqired: false,
      requires_deposit: true,
      requires_full_payment: false,
      requires_credit_card_on_file: false
    }
  end

  def clear_temp_password_if_activated
    self.temp_password = nil if self.password_digest.present?
  end
end

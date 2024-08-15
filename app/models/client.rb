class Client < ApplicationRecord
  has_secure_password validations: false
  has_many :invoices, dependent: :destroy
  has_many :schedules, dependent: :destroy
  has_many :payments, dependent: :destroy
  has_many :employee_clients, dependent: :destroy
  has_many :employees, through: :employee_clients
  has_many :response_intake_forms, dependent: :destroy
  has_many :chart_entries, dependent: :destroy

  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: 'Email Not valid' }, allow_nil: true
  validates :email, uniqueness: { message: 'Email already taken' }, allow_nil: true

  after_create :send_invitation_and_temp_password, if: -> { email.present? }

  def send_invitation_and_temp_password
    InvitationMailer.with(client: self).client_invitation.deliver_now
    send_client_reset_password_mail
  end

  def send_client_reset_password_mail
    rand_str = 5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("")
    update!(temp_password: "#{rand_str}".gsub(/\s+/, ""))

    SendClientResetPasswordLinkMailer.with(client: self).reset_password_mail.deliver_now
  end
end

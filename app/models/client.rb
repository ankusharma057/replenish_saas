class Client < ApplicationRecord
    has_secure_password validations: false
    has_many :invoices, dependent: :destroy
    has_many :schedules, dependent: :destroy
    has_many :payments, dependent: :destroy
    has_many :employee_clients, dependent: :destroy
    has_many :employees, through: :employee_clients
    has_many :response_intake_forms, dependent: :destroy

    validates :name, :email, :temp_password, presence: true
    validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: 'Email Not valid' }
    validates :email, uniqueness: { message: 'Email already taken' }

    after_create :sent_invitation

    def sent_invitation
      InvitationMailer.with(client: self).client_invitation.deliver_now
    end
end
  
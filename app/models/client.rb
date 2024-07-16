class Client < ApplicationRecord
    has_secure_password validations: false
    has_many :invoices, dependent: :destroy
    has_many :schedules, dependent: :destroy
    has_many :payments, dependent: :destroy
    has_many :employee_clients, dependent: :destroy
    has_many :employees, through: :employee_clients
    has_many :response_intake_forms, dependent: :destroy

    validates :name, presence: true
    validates :email, uniqueness: true, allow_blank: true

    after_create :sent_invitation

    def sent_invitation
      # InvitationMailer.with(client: self).client_invitation.deliver_now
    end
end
  
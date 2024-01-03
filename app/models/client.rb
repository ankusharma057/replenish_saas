class Client < ApplicationRecord
    has_secure_password validations: false
    belongs_to :employee
    has_many :invoices
    has_many :schedules
    validates :name, presence: true
    validates :email, uniqueness: true, allow_blank: true

    after_create :sent_invitation

    def sent_invitation
      InvitationMailer.with(client: self).client_invitation.deliver_now
    end
end
  
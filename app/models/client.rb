class Client < ApplicationRecord
    belongs_to :employee
    has_many :invoices
    has_many :schedules
    validates :name, presence: true
    validates :email, uniqueness: true, allow_blank: true
end

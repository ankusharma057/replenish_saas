class ClientSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :address, :phone_number, :last_name, :preferred_name, :pronouns, :prefix, :middle_name, :created_at, :how_heard_about_us, :online_booking_policy, :online_booking_payment_policy, :notification_settings, :activated, :referred_employee, :stripe_id

  has_one :client_detail, serializer: ClientDetailSerializer

  def activated
    object.password_digest.present?
  end

  attribute :referred_employee do
    if object.referred_employee.present?
      {
        id: object.referred_employee.id,
        name: object.referred_employee.name
      }
    else
      {
        id: nil,
        name: ""
      }
    end
  end

  # def profile_photo
  #   if object.profile_photo.attached?
  #     Rails.application.routes.url_helpers.rails_blob_url(object.profile_photo, only_path: true)
  #   else
  #     nil
  #   end
  # end
end

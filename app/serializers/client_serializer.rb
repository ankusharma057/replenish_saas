class ClientSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :address, :phone_number, :last_name, :preferred_name, :pronouns, :prefix, :middle_name, :created_at, :profile_photo, :how_heard_about_us, :online_Booking_Policy, :online_Booking_Payment_Policy, :notification_settings, :activated

  has_one :client_detail, serializer: ClientDetailSerializer

  def activated
    object.password_digest.present?
  end

  def profile_photo
    if object.profile_photo.attached?
      Rails.application.routes.url_helpers.rails_blob_url(object.profile_photo, only_path: true)
    else
      nil
    end
  end
end

class ClientSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :address, :phone_number, :last_name, :preferred_name, :pronouns, :prefix, :middle_name, :created_at, :profile_photo
  has_one :client_detail, serializer: ClientDetailSerializer
  attribute :notification_settings

  def notification_settings
    object.schedules.pluck(:notification_settings)
  end

  def profile_photo
    if object.profile_photo.attached?
      Rails.application.routes.url_helpers.rails_blob_url(object.profile_photo, only_path: true)
    else
      nil
    end
  end
end

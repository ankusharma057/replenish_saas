class FileUpload < ApplicationRecord
  belongs_to :client
  has_one_attached :file_data

  validates :file_data, presence: true
end

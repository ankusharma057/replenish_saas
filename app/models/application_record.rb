class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  private

  def send_message(text)
    MessagingService::Client.new.send_message(text)
  end
end

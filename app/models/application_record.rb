class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  def send_message(text)
    # commenting for now to diable the send-message-functionality
    return true
    MessagingService::Client.new.send_message(text)
  end
end

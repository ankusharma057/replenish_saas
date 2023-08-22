# frozen_string_literal: true

require 'twilio-ruby'

module MessagingService
  class Client
    RECEIVER_NUMBER = +18325236736

    def initialize
      @client = Twilio::REST::Client.new account_sid, auth_token
    end

    def send_message(text)
      @client.messages.create(
        from: phone_number,
        to: RECEIVER_NUMBER,
        body: text
      )
    end

    private

    def account_sid
      ENV['twillio_account_sid']
    end

    def auth_token
      ENV['twillio_auth_token']
    end

    def phone_number
      ENV['twillio_phone_number']
    end
  end
end

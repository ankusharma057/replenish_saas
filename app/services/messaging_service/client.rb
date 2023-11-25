# frozen_string_literal: true

require 'twilio-ruby'

module MessagingService
  class Client
    RECEIVER_NUMBER = '+18324432909'
    INV_MANAGER_NUMBERS = ['+18324432909']

    def initialize
      @client = Twilio::REST::Client.new account_sid, auth_token
    end

    def send_message(text: , send_to_inv_manager: false)
      @client.messages.create(
        from: phone_number,
        to: RECEIVER_NUMBER,
        body: text
      )
      if send_to_inv_manager
        INV_MANAGER_NUMBERS.each do |manager_number|
          @client.messages.create(
            from: phone_number,
            to: manager_number,
            body: text
          )
        end
      end
    rescue Exception => e
      puts e
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

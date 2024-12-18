module TelegramBot
  def self.send_message(message, parse_mode = nil)
    telegram_bot = Rails.application.credentials.telegram_bot
    url = "#{telegram_bot[:proxy_api]}/bot#{telegram_bot[:token]}/sendMessage"
    payload = {
      chat_id: telegram_bot[:chat_id],
      message_thread_id: telegram_bot[:message_thread_id],
      text: message
    }

    payload[:parse_mode] = parse_mode if parse_mode

    begin
      response = Net::HTTP.post(
        URI(url),
        payload.to_json,
        "Content-Type" => "application/json"
      )

      unless response.code == "200"
        Rails.logger.error "Failed to send Telegram message: #{response.code} - #{response.body}"
      end
    rescue => e
      Rails.logger.error "Error sending Telegram message: #{e.message}"
    end
  end
end

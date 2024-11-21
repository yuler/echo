class CheckViraTokenJob < ApplicationJob
  queue_as :default

  def perform(*args)
    token = Setting.vira_token
    _, base64_payload, _ = token.split(".")
    payload = JSON.parse(Base64.decode64(base64_payload))
    expired_at = payload["exp"]
    if expired_at < 5.days.from_now.to_i
      send_notification_to_telegram "@yedday\nThe Vira token will expire on #{Time.at(expired_at).strftime('%Y-%m-%d %H:%M:%S')}.\nPlease renew it before expiration."
    end
  end

  private
    def send_notification_to_telegram(message)
      telegram_bot = Rails.application.credentials.telegram_bot
      url = "#{telegram_bot[:proxy_api]}/bot#{telegram_bot[:token]}/sendMessage"
      payload = {
        chat_id: telegram_bot[:chat_id],
        message_thread_id: telegram_bot[:message_thread_id],
        text: message
      }
      response = Net::HTTP.post(
        URI(url),
        payload.to_json,
        "Content-Type" => "application/json"
      )
      Rails.logger.info(response.body.to_s)
    end
end

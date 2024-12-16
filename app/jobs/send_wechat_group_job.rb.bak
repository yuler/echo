class SendWechatGroupJob < ApplicationJob
  queue_as :default

  def perform(*args)
    Rails.logger.info "Starting SendWechatGroupJob"

    post = Post.last

    if 1.day.ago > post.created_at
      Rails.logger.warn "Today don't have new post"
      return
    end

    # send to wechat group
    client = Faraday.new(url: "https://wechat-webhook.hz.yuler.dev") do |builder|
      builder.headers["Content-Type"] = "application/json"
    end

    response = client.post("/webhook/msg/v2?token=WEBHOOK_TOKEN") do |req|
      req.body = {
        to: "Fighting for IELTS🔥",
        isRoom: true,
        data: {
          content: [
            "📖 Daily Read Notification",
            "",
            "#{post.title_english}",
            "",
            "#{post.title}",
            "",
            "#{post.introduce}",
            "",
            "🔗 https://reads.yuler.cc/posts/#{post.slug}"
          ].join("\n")
        }
      }.to_json
    end

    if response.status == 200
      Rails.logger.info "Successfully sent WeChat notification"
    else
      Rails.logger.error "Failed to send WeChat notification. Status: #{response.status}"
      raise "response.status is not 200"
    end
  end
end

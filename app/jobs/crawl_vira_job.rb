require "open-uri"

class CrawlViraJob < ApplicationJob
  queue_as :default

  FEED_URL = "https://vira.llsapp.com/api/v2/readings?size=1".freeze

  # TODO: Move to .env
  TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzA5OTY4NzAsInBvb2xfaWQiOiIxZTEyOTM1MjM2NGY3Y2Y1NTQ0MDAwYWIyNjgyZmUyMyIsInVzZXJfaWQiOjc2MDE0NTM0fQ._uwPoY6T-3TWR5JwCFhyet4dv_Yx6vX9BpsinBHHxzU".freeze
  LOGIN_ID = "3485123782".freeze
  DEVICE_ID = "96b92b8800bc40a6a7421cc6fc25726e5decc7cb".freeze

  HEADERS = {
    "Accept" => "*/*",
    "Accept-Language" => "zh;q=1",
    "User-Agent" => "Vira/2.29.16 (iPhone; iOS 17.6.1; Scale/3.00)",
    "X-App-Id" => "vira",
    "Authorization" => "Bearer #{TOKEN}",
    "token" => TOKEN,
    "X-Login" => LOGIN_ID,
    "X-Device-Id" => DEVICE_ID,
    "X-S-Device-Id" => DEVICE_ID
  }.freeze

  def perform(*args)
    latest = crawlLatestPost
    post = Post.create(
      title: latest["title"],
      title_english: latest["engTitle"],
      third_id: latest["id"],
      topics: latest["topics"].map { |topic| topic["name"] }.join(","),
    )

    detail = crawlPostDetail(post.third_id)
    post.update(
      guide: detail["guide"],
      content: detail["content"]["text"],
      notes: detail["notes"].flatten.join,
      metadata: detail
    )

    # TODO: Refactor to a single parse metadata
    post.download_poster
    post.download_cover
    post.download_audio
  end

  private

  def client
    @client ||= Faraday.new(url: "https://vira.llsapp.com") do |builder|
      builder.headers = HEADERS
      builder.response :json
    end
  end

  def crawlLatestPost
    response = client.get("api/v2/readings?size=1")
    raise "response.status is not 200" if response.status != 200
    response.body["items"].first # => json
  end

  def crawlPostDetail(id)
    response = client.get("api/v2/readings/#{id}/explanation")
    raise "response.status is not 200" if response.status != 200
    response.body
  end
end

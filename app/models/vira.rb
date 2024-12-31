module Vira
  TOKEN = Setting.vira_token
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

  def self.token
    Setting.vira_token
  end

  def self.token=(value)
    Setting.vira_token = value
  end

  def self.token_valid?
    client.get("api/v2/readings?size=1").status == 200
  end

  # TODO:
  def self.refresh_token
  end

  def self.crawl_latest_post
    response = client.get("api/v2/readings?size=1")
    raise "API request failed: response=#{response}" if response.status != 200
    latest = response.body["items"].first
    post = Post.create(
      title: latest["title"],
      title_english: latest["engTitle"],
      third_id: latest["id"],
      topics: latest["topics"].map { |topic| topic["name"] }.join(","),
    )

    response = client.get("api/v2/readings/#{latest["id"]}/explanation")
    raise "API request failed: response=#{response}" if response.status != 200
    latest_detail = response.body
    post.update(
      guide: latest_detail["guide"],
      content: latest_detail["content"]["text"],
      notes: latest_detail["notes"].flatten.join,
      metadata: latest_detail
    )

    post.download_poster
    post.download_cover
    post.download_audio
  end

  private
    def self.client
      @client ||= Faraday.new(url: "https://vira.llsapp.com") do |builder|
        builder.headers = HEADERS
        builder.response :json
      end
    end
end

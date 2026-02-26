class Vira
  class << self
    def login_id
      ENV["VIRA_LOGIN_ID"]
    end

    def device_id
      ENV["VIRA_DEVICE_ID"]
    end

    def token
      @token ||= ENV["VIRA_TOKEN"]
    end

    def token=(value)
      @token = value
    end

    def refresh_token
      @refresh_token ||= ENV["VIRA_REFRESH_TOKEN"]
    end

    def refresh_token=(value)
      @refresh_token = value
    end

    def token_valid?
      client.get("api/v2/user/info").status == 200
    end

    # TODO: test refresh access token flow
    def refresh_access_token
      payload = {
        "authFlow" => "REFRESH_TOKEN",
        "refreshTokenParams" => {
          "token" => token,
          "refreshToken" => refresh_token
        },
        "deviceId" => device_id
      }
      response = Faraday.post("https://account.llsapp.com/api/v2/initiate_auth", payload.to_json, "Content-Type" => "application/json; charset=utf-8")
      raise "API request failed: status=#{response.status}" unless response.success?

      result = response.body["authenticationResult"]

      token = result["accessToken"]
      refresh_token = result["refreshToken"]
      { token: token, refresh_token: refresh_token }
    rescue Faraday::Error => e
      Rails.logger.error "Vira token refresh failed: #{e.message}"
      raise
    end

    def fetch_user_info
      client.get("api/v2/user/info").body
    end

    def fetch_latest_post
      json = {}
      # fetch latest post
      response = client.get("api/v2/readings?size=1")
      json["reading"] = response.body["items"].first

      # fetch audio details
      response = client.get("api/v2/readings/#{json["reading"]["id"]}/audio")
      json["audio"] = response.body

      # fetch explanation details
      response = client.get("api/v2/readings/#{json["reading"]["id"]}/explanation")
      json["explanation"] = response.body
      Rails.logger.debug "Vira post fetched: #{json.dig('reading', 'id')}"

      json
    end

    private
      def client
        @client ||= Faraday.new(url: "https://vira.llsapp.com") do |builder|
          builder.headers = {
            "Accept" => "*/*",
            "Accept-Language" => "zh;q=1",
            "User-Agent" => "Vira/2.29.16 (iPhone; iOS 17.6.1; Scale/3.00)",
            "X-App-Id" => "vira",
            "Authorization" => "Bearer #{token}",
            "token" => token,
            "X-Login" => login_id,
            "X-Device-Id" => device_id,
            "X-S-Device-Id" => device_id
          }.freeze
          builder.response :raise_error
          builder.response :json
        end
      end
  end
end

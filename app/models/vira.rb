class Vira
  LOGIN_ID = ENV["VIRA_LOGIN_ID"].freeze
  DEVICE_ID = ENV["VIRA_DEVICE_ID"].freeze

  TOKEN = ENV["VIRA_TOKEN"].freeze
  REFRESH_TOKEN = ENV["VIRA_REFRESH_TOKEN"].freeze

  class << self
    def token
      @token ||= TOKEN
    end

    def token=(value)
      @token = value
    end

    def refresh_token
      @refresh_token ||= REFRESH_TOKEN
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
        "deviceId" => DEVICE_ID
      }
      response = Faraday.post("https://account.llsapp.com/api/v2/initiate_auth", payload.to_json, "Content-Type" => "application/json; charset=utf-8")
      raise "API request failed: response=#{response.body}" if response.status != 200

      result = JSON.parse(response.body)["authenticationResult"]

      token = result["accessToken"]
      refresh_token = result["refreshToken"]
      { token: token, refresh_token: refresh_token }
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
      Rails.logger.debug json.to_json

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
            "X-Login" => LOGIN_ID,
            "X-Device-Id" => DEVICE_ID,
            "X-S-Device-Id" => DEVICE_ID
          }.freeze
          builder.params = {
            "appId" => "vira",
            "login" => LOGIN_ID,
            "deviceId" => DEVICE_ID,
            "sDeviceId" => DEVICE_ID,
            "token" => token
          }
          builder.use(Class.new(Faraday::Middleware) do
            def on_complete(env)
              status = env[:status]
              return if status && status >= 200 && status < 300
              raise "API request failed: status=#{status} response=#{env[:body]}"
            end
          end)
          builder.response :json
        end
      end
  end
end

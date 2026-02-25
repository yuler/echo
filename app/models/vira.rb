class Vira
  LOGIN_ID = "3485123782".freeze
  DEVICE_ID = "96b92b8800bc40a6a7421cc6fc25726e5decc7cb".freeze

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
      puts "result: #{result}"

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

  # def self.crawl_latest_post
  #   response = client.get("api/v2/readings?size=1")
  #   raise "API request failed: response=#{response.body}" if response.status != 200
  #   latest = response.body["items"].first
  #   post = Post.create(
  #     title: latest["title"],
  #     title_english: latest["engTitle"],
  #     third_id: latest["id"],
  #     topics: latest["topics"].map { |topic| topic["name"] }.join(","),
  #   )

  #   response = client.get("api/v2/readings/#{latest["id"]}/explanation")
  #   raise "API request failed: response=#{response.body}" if response.status != 200

  #   latest_detail = response.body
  #   post.update(
  #     guide: latest_detail["guide"],
  #     content: latest_detail["content"]["text"],
  #     notes: latest_detail["notes"].flatten.join,
  #     metadata: latest_detail
  #   )

  #   post.download_poster
  #   post.download_cover
  #   post.download_audio
  # end
end

# TODO: Move this to `docs` folder, with some text describing the API request flow
# # send sms
# curl -X POST "https://account.llsapp.com/api/v2/initiate_auth" \
#   -H "Host: account.llsapp.com" \
#   -H "X-App-ID: vira" \
#   -H "Accept: */*" \
#   -H "X-B3-Traceid: d7c2843e514b9f4af7a94da1eb1d4a91" \
#   -H "X-B3-Spanid: ccde96c9253babd5" \
#   -H "Accept-Encoding: gzip, deflate, br" \
#   -H "Cache-Control: no-cache" \
#   -H "Accept-Language: en-CN;q=1, zh-Hans-CN;q=0.9, ja-CN;q=0.8" \
#   -H "Content-Type: application/json" \
#   -H "User-Agent: LingoVira/2.29.21 (iPhone; iOS 17.6.1; Scale/3.00)" \
#   -d '{"smsCodeParams":{"sig":"4c4532ef3bd32a2a309e9a9340f9e695f03a468a","timestampSec":1770866327,"mobileEncrypted":"gEn0BKnpNyLabwVgbOpMjBq0odDbmyAHNGLhVbRBhHSxDR5T4PgcdWc8J39ONXBlC+f768173Y4kdFOBKe1CQQr+t\/mwgUocgwt9gLM+C6fCjw2YyrnSeQlbi8oRXhmSAAlKwK3kB4D0NJqZP4Y4vN5dCZSN9nWwy1IMof2JpG6hJ6zJU852UdLYgt0KWgoJWWRGPCkrdrhVTrzwqqtZyqc1f+AoAcx4GWH\/Zrw71aGBoigEZufzew56k6MgxZVzkPPvPU5mnBdI0wDciyz162Dh6oyurR9QfsibrN91rVSwbXfQfQ5yZBOUDLwL05aK74amiLoHQzTT1BqqkQR8Mg=="},"isSignup":true,"deviceId":"96b92b8800bc40a6a7421cc6fc25726e5decc7cb","clientPlatform":"IOS","appId":"VIRA","authFlow":"SMS_CODE","poolId":"1e129352364f7cf5544000ab2682fe23"}'

# response
# {"authenticationResult":null,"challengeType":"SMS_CODE","challengeParams":{},"session":"d303f40a-973b-4154-875b-89cb543b2c5c"}

# sms login, need to change the session & code
# curl -X POST "https://account.llsapp.com/api/v2/respond_to_auth_challenge" \
#   -H "Host: account.llsapp.com" \
#   -H "X-App-ID: vira" \
#   -H "Accept: */*" \
#   -H "X-B3-Traceid: bcff54732892f86773cdf8354e2351dd" \
#   -H "X-B3-Spanid: 8c6bedb4b8a0071e" \
#   -H "Accept-Encoding: gzip, deflate, br" \
#   -H "Cache-Control: no-cache" \
#   -H "Accept-Language: en-CN;q=1, zh-Hans-CN;q=0.9, ja-CN;q=0.8" \
#   -H "Content-Type: application/json" \
#   -H "User-Agent: LingoVira/2.29.21 (iPhone; iOS 17.6.1; Scale/3.00)" \
#   -d '{"isSignup":true,"challengeType":"SMS_CODE","deviceId":"96b92b8800bc40a6a7421cc6fc25726e5decc7cb","appId":"VIRA","session":"d303f40a-973b-4154-875b-89cb543b2c5c","smsResp":{"code":"789661","mobileEncrypted":"NMQf9UCWOfct59rl4OGl1i4h4tmKnLdTq76FUkvLPVvlEDByC49xaCGo3DwY1gOu+GJIetiYnZ5x0ci+r04oR22RR45FL0oIgYTlT9FRKRQDQjtq4aO7vJpK2sD+Dx1MIXTlVjVGYyEF\/Kl0Bk6Tm4EEoPNDSIjyWyN4J6+72DJoM8ynk3cJAQruQkVHuL+0oUCHVifwFfD6HjgP7Lvxe9JhLWFiXQImxuo63sBCTohxYdhkRMpx+SsFdRASoTFa3HGVZLzMHehYS04Erdbqn6h4VFHw5nVZkkupF56bpc92YfUVhuDmke8l3zCRgfU3dkJvpV7VFn5z8GQ87wM1QA=="},"poolId":"1e129352364f7cf5544000ab2682fe23","clientPlatform":"IOS"}'

# response
# {"authenticationResult":{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzI1OTU4ODEsInBvb2xfaWQiOiIxZTEyOTM1MjM2NGY3Y2Y1NTQ0MDAwYWIyNjgyZmUyMyIsInVzZXJfaWQiOjg0NTY3NDIwfQ.BBE6ZlmkJx1io4Pk9CNHfG6kRo6ucXa_ZW0RIByj0Xo","expiresAtSec":"1772595881","refreshToken":"b1bf5930-1d20-458f-8e6b-b7f9faee057b","isNewRegister":false,"nick":"yuler","avatar":"https://cdn.llscdn.com/avatars/v2/avatars_agender_watermelon.png","login":"270001585","id":"NWYwMWQwMDAwNTBhNjU3Yw==","registerAtSec":"1770866069","mobile":"177****6915","oauthInfo":null,"appId":"vira","deviceId":"96b92b8800bc40a6a7421cc6fc25726e5decc7cb","isFullNewRegister":false,"setToken":false,"pwdExist":false,"requestId":"ehN1MdF7vLP7ff7iUEwYcurWikhEoSbs","securityMessage":""},"challengeType":"INVALID","challengeParams":{},"session":"","challengeInfo":null}

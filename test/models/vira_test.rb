require "test_helper"

class ViraTest < ActiveSupport::TestCase
  setup do
    if ENV["CI"] || ENV["VIRA_LOGIN_ID"].blank? || ENV["VIRA_DEVICE_ID"].blank? || ENV["VIRA_TOKEN"].blank?
      skip "Skipping ViraTest due to missing Vira environment variables or CI environment"
    end
  end

  test "token is valid" do
    assert Vira.token_valid?
  end

  test "fetch user info" do
    json = Vira.fetch_user_info
    p json.to_json
    assert_not(json.key?("error"), "Error returned from API: #{json}")
  end
end

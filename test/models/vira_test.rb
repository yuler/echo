require "test_helper"

class ViraTest < ActiveSupport::TestCase
  setup do
    if ENV["CI"]
      skip "Skipping ViraTest in CI environment"
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

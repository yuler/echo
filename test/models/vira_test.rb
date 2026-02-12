require "test_helper"

class ViraTest < ActiveSupport::TestCase
  test "fetch user info" do
    puts Vira.fetch_user_info
    assert_equal "Unauthenticated.", Vira.fetch_user_info
  end
end

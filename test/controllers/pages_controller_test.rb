require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "should get show for existing about template" do
    get about_url
    assert_response :success
    assert_select "body", /# About Us/
  end
end

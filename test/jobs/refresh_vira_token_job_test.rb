require "test_helper"

class RefreshViraTokenJobTest < ActiveJob::TestCase
  test "no-ops when token or refresh token is missing" do
    called = false
    Vira.stub :token, "" do
      Vira.stub :refresh_token, "r" do
        Vira.stub :refresh_access_token, -> { called = true; raise "should not run" } do
          RefreshViraTokenJob.perform_now
        end
      end
    end
    assert_not called

    Vira.stub :token, "t" do
      Vira.stub :refresh_token, "" do
        Vira.stub :refresh_access_token, -> { called = true; raise "should not run" } do
          RefreshViraTokenJob.perform_now
        end
      end
    end
    assert_not called
  end

  test "refreshes when credentials are present" do
    refreshed = false
    Vira.stub :token, "t" do
      Vira.stub :refresh_token, "r" do
        Vira.stub :refresh_access_token, -> { refreshed = true } do
          RefreshViraTokenJob.perform_now
        end
      end
    end
    assert refreshed
  end
end

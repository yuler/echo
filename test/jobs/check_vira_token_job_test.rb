require "test_helper"

class CheckViraTokenJobTest < ActiveJob::TestCase
  test "check vira token expired" do
    next if ENV["CI"]
    Setting.vira_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzI0NTg5MTMsInBvb2xfaWQiOiIxZTEyOTM1MjM2NGY3Y2Y1NTQ0MDAwYWIyNjgyZmUyMyIsInVzZXJfaWQiOjc2MDE0NTM0fQ.0Pn9KxnwsUiIiL0uMeQNeY0a6Tnu1J_SbUC9o6JI8eE"
    CheckViraTokenJob.perform_now
  end
end

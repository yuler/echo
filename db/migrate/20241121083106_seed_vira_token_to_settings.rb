class SeedViraTokenToSettings < ActiveRecord::Migration[8.0]
  def change
    Setting.vira_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzM5MDU2NDgsInBvb2xfaWQiOiIxZTEyOTM1MjM2NGY3Y2Y1NTQ0MDAwYWIyNjgyZmUyMyIsInVzZXJfaWQiOjc2MDE0NTM0fQ.FOb7c1yteVCIIzP0RW0QHQITGimpmIXm8vjpZO7NdX0"
  end
end

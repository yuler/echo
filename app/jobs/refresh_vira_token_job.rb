class RefreshViraTokenJob < ApplicationJob
  queue_as :backend

  def perform
    return if Vira.token.blank? || Vira.refresh_token.blank?

    Vira.refresh_access_token
  end
end

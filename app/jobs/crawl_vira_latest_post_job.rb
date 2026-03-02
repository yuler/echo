class CrawlViraLatestPostJob < ApplicationJob
  queue_as :backend

  def perform
    Post.crawl_vira_latest_post
  end
end

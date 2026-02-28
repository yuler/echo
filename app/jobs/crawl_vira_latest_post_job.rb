class CrawlViraLatestPostJob < ApplicationJob
  queue_as :default

  def perform
    Post.crawl_vira_latest_post
  end
end

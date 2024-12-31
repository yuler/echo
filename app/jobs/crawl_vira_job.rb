require "open-uri"

class CrawlViraJob < ApplicationJob
  queue_as :default

  def perform
    Vira.crawl_latest_post
  end
end

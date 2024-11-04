require "test_helper"

class CrawlViraJobTest < ActiveJob::TestCase
  test "crawl vira feed" do
    assert_nothing_raised do
      CrawlViraJob.perform_now
    end
  end
end

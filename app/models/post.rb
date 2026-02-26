class Post < ApplicationRecord
  has_rich_text :content

  def paragraphs
    text = content&.to_plain_text.to_s
    text.split(/\n+/).map(&:strip).reject(&:blank?)
  end

  def bilingual_paragraphs
    paragraphs.map do |para|
      { text: para, chinese: para.match?(/\p{Han}/) }
    end
  end

  def audio_sentences_with_translation
    return [] unless raw_json&.dig("audio", "content")

    audio_items = raw_json["audio"]["content"]
    chinese_paras = bilingual_paragraphs.select { |p| p[:chinese] }

    audio_items.slice_before { |item| item["paragraph"] }.map.with_index do |sentences, index|
      {
        sentences: sentences,
        chinese: chinese_paras[index] ? chinese_paras[index][:text] : nil
      }
    end
  end

  def english_paragraphs
    paragraphs.reject { |p| p.match?(/\p{Han}/) }
  end

  def formatted_duration
    if audio_duration
      total_seconds = audio_duration / 1000
      minutes = total_seconds / 60
      seconds = total_seconds % 60
      "#{minutes}:#{seconds.to_s.rjust(2, '0')}"
    else
      "0:00"
    end
  end

  def minutes_left
    if audio_duration
      (audio_duration / 60_000.0).round
    else
      0
    end
  end

  def topics_list
    if topics
      if topics.is_a?(String)
        topics.split(",").map(&:strip)
      else
        Array(topics)
      end
    else
      []
    end
  end

  def self.crawl_vira_latest_post
    json = Vira.fetch_latest_post

    find_or_create_by(third_id: json.dig("reading", "id")) do |post|
      post.title = json.dig("reading", "title")
      post.title_en = json.dig("reading", "engTitle")
      post.topics = json.dig("reading", "topics")&.map { |topic| topic["name"] }&.join(",")
      post.poster_url = json.dig("explanation", "posterUrl")
      post.cover_url = json.dig("explanation", "shareImgUrl") || json.dig("explanation", "imgUrl")
      post.audio_url = json.dig("audio", "url")
      post.audio_duration = json.dig("audio", "duration")
      post.explanation_audio_url = json.dig("explanation", "voice", "url")
      post.explanation_audio_duration = json.dig("explanation", "voice", "durationMs")
      post.guide = json.dig("explanation", "guide")
      post.content = json.dig("explanation", "content", "text")
      post.notes = json.dig("explanation", "notes")&.flatten&.join
      post.published_at = json.dig("reading", "publishTime")
      post.raw_json = json
    end
  rescue Faraday::Error => e
    Rails.logger.error "Failed to crawl Vira post: #{e.message}"
    raise
  end
end

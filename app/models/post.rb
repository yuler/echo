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

  def english_paragraphs
    paragraphs.reject { |p| p.match?(/\p{Han}/) }
  end

  def formatted_duration
    return "0:00" unless audio_duration
    minutes = audio_duration / 60
    seconds = audio_duration % 60
    "#{minutes}:#{seconds.to_s.rjust(2, '0')}"
  end

  def minutes_left
    return 0 unless audio_duration
    (audio_duration / 60.0).ceil
  end

  def topics_list
    return [] unless topics
    if topics.is_a?(String)
      topics.split(",").map(&:strip)
    else
      Array(topics)
    end
  end

  def self.crawl_vira_latest_post
    json = Vira.fetch_latest_post
    if post = Post.find_by(third_id: json["id"])
      return post
    end

    Post.create!(
      third_id: json["reading"]["id"],
      title: json["reading"]["title"],
      title_en: json["reading"]["engTitle"],
      topics: json["reading"]["topics"].map { |topic| topic["name"] }.join(","),
      poster_url: json["explanation"]["posterUrl"],
      cover_url: json["explanation"]["shareImgUrl"] || json["explanation"]["imgUrl"],
      audio_url: json["audio"]["url"],
      audio_duration: json["audio"]["duration"],
      explanation_audio_url: json["explanation"]["voice"]["url"],
      explanation_audio_duration: json["explanation"]["voice"]["durationMs"],
      guide: json["explanation"]["guide"],
      content: json["explanation"]["content"]["text"],
      notes: json["explanation"]["notes"].flatten.join,
      published_at: json["reading"]["publishTime"],
      raw_json: json
    )
  end
end

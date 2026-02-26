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
    return [] unless raw_json && raw_json["audio"] && raw_json["audio"]["content"]

    audio_items = raw_json["audio"]["content"]
    chinese_paras = bilingual_paragraphs.select { |p| p[:chinese] }

    grouped = []
    current_para = []
    para_index = 0

    audio_items.each do |item|
      if item["paragraph"] && current_para.any?
        grouped << {
          sentences: current_para,
          chinese: chinese_paras[para_index] ? chinese_paras[para_index][:text] : nil
        }
        current_para = []
        para_index += 1
      end
      current_para << item
    end

    if current_para.any?
      grouped << {
        sentences: current_para,
        chinese: chinese_paras[para_index] ? chinese_paras[para_index][:text] : nil
      }
    end

    grouped
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

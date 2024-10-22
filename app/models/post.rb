class Post < ApplicationRecord
  has_rich_text :content
  has_one_attached :audio

  validates :third_id, presence: true, uniqueness: true

  def download_audio
    audio_data = URI.open(metadata["voice"]["url"])
    audio.attach(io: audio_data, filename: id, content_type: "audio/mpeg")
  end
end

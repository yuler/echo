require "open-uri"

class Post < ApplicationRecord
  before_save :generate_slug, if: :title_english_changed?

  has_one_attached :poster
  has_one_attached :cover
  has_one_attached :audio

  has_rich_text :content
  has_rich_text :notes

  validates :third_id, presence: true, uniqueness: true
  validates :title, :title_english, presence: true
  # validates :slug, presence: true, uniqueness: true

  scope :newest, -> { order(created_at: :desc, id: :desc) }

  alias_attribute :introduce, :guide

  def download_poster
    poster_data = URI.parse(metadata["posterUrl"]).open
    extension = extension(metadata["posterUrl"])
    filename = "#{id}.#{extension}"
    poster.attach(io: poster_data, filename: filename, content_type: "image/jpeg")
  end

  def download_cover
    cover_data = URI.parse(metadata["content"]["coverUrl"]).open
    extension = extension(metadata["content"]["coverUrl"])
    filename = "#{id}.#{extension}"
    cover.attach(io: cover_data, filename: filename, content_type: "image/jpeg")
  end

  def download_audio
    audio_data = URI.parse(metadata["voice"]["url"]).open
    extension = extension(metadata["voice"]["url"])
    filename = "#{id}.#{extension}"
    audio.attach(io: audio_data, filename: filename, content_type: "audio/mpeg")
  end

  def generate_slug
    self.slug = title_english.parameterize
  end

  private

  def extension(url)
    url.split(".").last
  end
end

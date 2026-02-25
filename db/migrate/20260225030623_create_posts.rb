class CreatePosts < ActiveRecord::Migration[8.2]
  def change
    create_table :posts, id: :uuid do |t|
      t.string :third_id
      t.string :title
      t.string :title_en
      t.json :topics

      t.string :guide
      t.json :notes
      t.string :poster_url
      t.string :cover_url
      t.string :audio_url
      t.integer :audio_duration
      t.string :explanation_audio_url
      t.integer :explanation_audio_duration
      t.datetime :published_at
      t.json :raw_json

      t.timestamps
    end
  end
end

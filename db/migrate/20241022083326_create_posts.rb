class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.string :title
      t.string :poster
      t.string :topics
      t.date :published
      t.json :metadata

      t.timestamps
    end
  end
end

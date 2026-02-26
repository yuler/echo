class AddIndexesToPosts < ActiveRecord::Migration[8.2]
  def change
    add_index :posts, :third_id, unique: true
    add_index :posts, :published_at
  end
end

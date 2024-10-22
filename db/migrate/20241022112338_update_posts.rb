class AddThirdIdToPosts < ActiveRecord::Migration[8.1]
  def change
    add_column :posts, :third_id, :string
    add_column :posts, :title_english, :string
    add_index :posts, :third_id, unique: true
  end
end

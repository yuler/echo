class AddGuideToPost < ActiveRecord::Migration[8.1]
  def change
    add_column :posts, :guide, :string
  end
end

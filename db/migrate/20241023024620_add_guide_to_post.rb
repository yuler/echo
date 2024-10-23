class AddGuideToPost < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :guide, :string
  end
end

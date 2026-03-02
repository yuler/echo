class CreateCheckIns < ActiveRecord::Migration[8.2]
  def change
    create_table :check_ins, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :post, null: false, foreign_key: true, type: :uuid
      t.text :content

      t.timestamps
    end

    add_index :check_ins, [:user_id, :post_id], unique: true
    add_index :check_ins, [:user_id, :created_at]
  end
end

class CreateSettings < ActiveRecord::Migration[8.2]
  def change
    create_table :settings, id: :uuid do |t|
      t.string :var, null: false
      t.text :value

      t.timestamps
    end
    add_index :settings, %w(var), unique: true
  end
end

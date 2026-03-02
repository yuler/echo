class CheckIn < ApplicationRecord
  belongs_to :user
  belongs_to :post

  validates :user_id, uniqueness: { scope: :post_id, message: "has already checked in to this post" }

  after_commit :invalidate_user_cache, on: [ :create, :destroy ]

  private

  def invalidate_user_cache
    user.invalidate_check_in_stats_cache
  end
end

class User < ApplicationRecord
  include Role

  belongs_to :account
  belongs_to :identity, optional: true

  has_many :check_ins, dependent: :destroy

  validates :name, presence: true

  # TODO: deactivate user
  def deactivate
    transaction do
      # accesses.destroy_all
      # update! active: false, identity: nil
      # close_remote_connections
    end
  end

  def verified?
    verified_at.present?
  end

  def verify
    update!(verified_at: Time.current) unless verified?
  end

  def checked_in?(post)
    check_ins.exists?(post: post)
  end

  def check_in_stats
    Rails.cache.fetch("user/#{id}/check_in_stats", expires_in: 30.minutes) do
      calculate_check_in_stats
    end
  end

  def invalidate_check_in_stats_cache
    Rails.cache.delete("user/#{id}/check_in_stats")
  end

  private
    def calculate_check_in_stats
      dates = check_ins.map { |ci| ci.created_at.to_date }.uniq.sort.reverse
      return { total: 0, current_streak: 0, longest_streak: 0, last_check_in_date: nil } if dates.empty?

      total = check_ins.count
      today = Date.current

      streaks = dates.slice_when { |prev, curr| prev != curr + 1.day }.map(&:size)
      longest_streak = streaks.max || 0

      current_streak = 0
      if dates.first == today || dates.first == today - 1.day
        current_streak = streaks.first || 0
      end

      {
        total: total,
        current_streak: current_streak,
        longest_streak: longest_streak,
        last_check_in_date: dates.first
      }
    end
end

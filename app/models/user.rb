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
      # Optimized to fetch unique dates directly from the database.
      dates = check_ins.select("DISTINCT CAST(created_at AS DATE) AS d").order("d DESC").pluck(:d)
      return { total: 0, current_streak: 0, longest_streak: 0, last_check_in_date: nil } if dates.empty?

      total = check_ins.count
      today = Date.current

      current_streak = 0
      longest_streak = 0
      current_run = 0
      last_date = nil

      # A streak is "current" if it includes today or yesterday and is contiguous from the first check-in date.
      is_part_of_current_streak = !dates.empty? && (dates.first == today || dates.first == today - 1.day)

      dates.each do |date|
        if last_date && date == last_date - 1.day
          current_run += 1
        else
          # A break in the streak.
          is_part_of_current_streak = false # The first sequence is broken.
          current_run = 1
        end

        longest_streak = [ longest_streak, current_run ].max
        current_streak = current_run if is_part_of_current_streak
        last_date = date
      end

      {
        total: total,
        current_streak: current_streak,
        longest_streak: longest_streak,
        last_check_in_date: dates.first
      }
    end
end

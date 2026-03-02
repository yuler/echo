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

  def check_in_stats
    Rails.cache.fetch("user/#{id}/check_in_stats", expires_in: 1.day) do
      calculate_check_in_stats
    end
  end

  def invalidate_check_in_stats_cache
    Rails.cache.delete("user/#{id}/check_in_stats")
  end

  private

  def calculate_check_in_stats
    check_ins_dates = check_ins.order(created_at: :desc).pluck(:created_at).map(&:to_date).uniq

    total = check_ins.count
    return { total: 0, current_streak: 0, longest_streak: 0, last_check_in_date: nil } if total == 0

    current_streak = 0
    longest_streak = 0
    current_temp_streak = 0
    last_date = nil

    today = Date.current

    if check_ins_dates.first == today || check_ins_dates.first == today - 1.day
      expected_date = check_ins_dates.first
      check_ins_dates.each do |date|
        if date == expected_date
          current_streak += 1
          expected_date -= 1.day
        else
          break
        end
      end
    end

    expected_date = check_ins_dates.first
    check_ins_dates.each do |date|
      if last_date.nil? || date == last_date - 1.day
        current_temp_streak += 1
      else
        longest_streak = [ longest_streak, current_temp_streak ].max
        current_temp_streak = 1
      end
      last_date = date
    end
    longest_streak = [ longest_streak, current_temp_streak ].max

    {
      total: total,
      current_streak: current_streak,
      longest_streak: longest_streak,
      last_check_in_date: check_ins_dates.first
    }
  end
end

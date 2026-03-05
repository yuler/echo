class Setting < ApplicationRecord
  serialize :value, coder: JSON

  def self.[](key)
    Rails.cache.fetch("settings/#{key}") do
      find_by(var: key)&.value
    end
  end

  def self.[]=(key, val)
    setting = find_or_initialize_by(var: key)
    setting.value = val
    setting.save!
    Rails.cache.write("settings/#{key}", val)
    val
  end

  def self.clean_all_cache
    Rails.cache.delete_matched("settings/*")
  end

  # Output all settings as Ruby code for copy-pasting
  def self.to_ruby_code
    Setting.all.each do |setting|
      puts "Setting.#{setting.var} = #{setting.value.inspect}"
    end
  end

  def self.method_missing(method_name, *args)
    if method_name.to_s.end_with?("=")
      self[method_name.to_s.chomp("=")] = args.first
    else
      self[method_name.to_s]
    end
  end

  def self.respond_to_missing?(method_name, include_private = false)
    true
  end
end

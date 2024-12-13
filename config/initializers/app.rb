module ReadsApp
  class << self
    def version
      "0.0.1"
    end

    def git_revision
      ENV["GIT_REVISION"] || `git rev-parse HEAD`.chomp
    end

    def build_time
      time_str = ENV["BUILD_TIME"] || `git log -1 --format=%cI`.chomp
      Time.parse(time_str).strftime("%Y-%m-%d %H:%M:%S %Z").chomp
    end
  end
end

module ReadsApp
  class << self
    def version
      "0.0.1"
    end

    def git_revision
      ENV["GIT_REVISION"] || `git rev-parse HEAD`.chomp
    end
  end
end

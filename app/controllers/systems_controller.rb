class SystemsController < ApplicationController
  def show
    @system = {
      # cpu_usage: cpu_usage,
      memory_usage: memory_usage,
      storage_dir_size: storage_dir_size,
    }
    @app = {
      version: ReadsApp.version,
      git_revision: ReadsApp.git_revision,
      build_time: ReadsApp.build_time,
      boot_time: ReadsApp.boot_time,
    }
    @settings = {
      vira_token: Setting.vira_token
    }
  end

  private
    # TODO: this is not accurate
    def cpu_usage
      begin
        "#{`top -b -n 1 | grep "Cpu(s)" | awk '{print 100 - $8 "%"}'`.strip.to_f}%"
      rescue StandardError => e
        Rails.logger.error "Error reading CPU usage: #{e.message}"
        "N/A"
      end
    end

    def memory_usage
      begin
        "#{`free -m | awk '/^Mem:/{print $3/$2 * 100}'`.strip.to_f}%"
      rescue StandardError => e
        Rails.logger.error "Error reading memory usage: #{e.message}"
        "N/A"
      end
    end

    def storage_dir_size
      `du -sh #{Rails.root.to_s}/storage`.split.first
    end
end

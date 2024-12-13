require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Reads
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # Timezone for UTC+8
    config.time_zone = "Asia/Shanghai"
    # config.eager_load_paths << Rails.root.join("extras")

    # Use proxy mode for Active Storage
    # Note: the default redirect mode will be cached by some apps, like WeChat, causing load failures
    config.active_storage.resolve_model_to_route = :rails_storage_proxy

    # Solid Queue & Solid Cache
    config.cache_store = :solid_cache_store
    config.active_job.queue_adapter = :solid_queue
    config.solid_queue.connects_to = { database: { writing: :queue } }

    # Logs
    config.lograge.enabled = true
    if Rails.env.production?
      # Broadcast to file log
      log_file = Rails.root.join("log", "#{Rails.env}.log")
      file_logger = Logger.new(log_file, 10, 10.megabytes)

      config.logger = ActiveSupport::BroadcastLogger.new(
        config.logger,
        file_logger
      )
    end
  end
end

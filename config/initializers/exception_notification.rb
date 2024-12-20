# refs: https://github.com/smartinez87/exception_notification/issues/429
# refs: https://gist.github.com/bendangelo/dddb8135229979b47cbceec0025c1bb7
require "action_dispatch"
require "active_support/core_ext/time"
require "cgi"

module ExceptionNotifier
  class TelegramNotifier
    def initialize(options)
      @default_options = options
    end

    def call(exception, options = {})
      env = options[:env]

      options = options.reverse_merge(@default_options)

      body = {}
      body[:error_class] = exception.class.to_s
      body[:message] = exception.message.inspect
      body[:backtrace] = exception.backtrace.first(options.delete(:backtrace_length) || 5)

      body[:data] = (env && env["exception_notifier.exception_data"] || {}).merge(options[:data] || {})

      unless env.nil?
        request = ActionDispatch::Request.new(env)

        request_items = {
          url: request.original_url,
          http_method: request.method,
          ip_address: request.remote_ip,
          parameters: request.filtered_parameters,
          timestamp: Time.current
        }

        body[:request] = request_items
        body[:session] = request.session
        # body[:environment] = request.filtered_env
      end

      body[:server] = Socket.gethostname
      # body[:process] = $PROCESS_ID
      # body[:rails_root] = Rails.root if defined?(Rails) && Rails.respond_to?(:root)

      # options[:body] ||= {}
      # # max message length
      # options[:body][:text] = format_hash_for_text(body)[0, 4096]

      p "==" * 100
      p "body: #{body}"
      p format_hash_for_text(body)[0, 4096]
      p "==" * 100

      resp = TelegramBot.send_message(format_hash_for_text(body)[0, 4096], "HTML")
      p "resp: #{resp}"
    end

    def format_hash_for_text(hash)
      formatted_string = ""
      hash.each do |key, value|
        formatted_string += "<b>#{key}</b>: "
        formatted_string += "#{CGI.escapeHTML(value.to_s)}\n"
      end
      formatted_string.chomp  # Remove trailing newline
    end
  end
end


require "exception_notification/rails"



ExceptionNotification.configure do |config|
  # Ignore additional exception types.
  # ActiveRecord::RecordNotFound, AbstractController::ActionNotFound and ActionController::RoutingError are already added.
  # config.ignored_exceptions += %w{ActionView::TemplateError CustomError}

  # Adds a condition to decide when an exception must be ignored or not.
  # The ignore_if method can be invoked multiple times to add extra conditions.
  config.ignore_if do |exception, options|
    not Rails.env.production?
  end

  # Notifiers =================================================================

  # Email notifier sends notifications by email.
  # config.add_notifier :email, {
  #   :email_prefix         => "[ERROR] ",
  #   :sender_address       => %{"Notifier" <notifier@example.com>},
  #   :exception_recipients => %w{exceptions@example.com}
  # }

  # Campfire notifier sends notifications to your Campfire room. Requires 'tinder' gem.
  # config.add_notifier :campfire, {
  #   :subdomain => 'my_subdomain',
  #   :token => 'my_token',
  #   :room_name => 'my_room'
  # }

  # HipChat notifier sends notifications to your HipChat room. Requires 'hipchat' gem.
  # config.add_notifier :hipchat, {
  #   :api_token => 'my_token',
  #   :room_name => 'my_room'
  # }

  # Webhook notifier sends notifications over HTTP protocol. Requires 'httparty' gem.
  # config.add_notifier :webhook, {
  #   :url => 'http://example.com:5555/hubot/path',
  #   :http_method => :post
  # }

  # Custom Notifier
  config.add_notifier :telegram, {}
end

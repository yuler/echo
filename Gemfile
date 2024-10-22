source "https://rubygems.org"

ruby file: ".ruby-version"

gem "rails", github: "rails/rails", branch: "main"

# Drivers
gem "sqlite3", ">= 2.1"

# Deployment
gem "puma", ">= 5.0"
gem "bootsnap", require: false
gem "thruster", require: false
gem "kamal", ">= 2.0.0.rc2", require: false

# Front-end
gem "propshaft"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "tailwindcss-rails"

# Use the database-backed adapters for Rails.cache, Active Job, and Action Cable
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"
# gem "mission_control-jobs"

# Other
gem "jbuilder"
gem "bcrypt", "~> 3.1.7"
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "image_processing", "~> 1.2"
gem "faraday"

group :development, :test do
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  # gem "faker", require: false
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
  gem "erb_lint", require: false
  gem "dotenv-rails"
end

group :development do
  gem "hotwire-livereload"
  gem "letter_opener"
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
end

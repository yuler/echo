module RailsStarter
  class << self
    def db_adapter
      @db_adapter ||= ENV.fetch("DB_ADAPTER", "sqlite")
    end
  end
end

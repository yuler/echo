module ApplicationHelper
  def format_duration(duration)
    Time.at(duration).utc.strftime("%M:%S")
  end
end

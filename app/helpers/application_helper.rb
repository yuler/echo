module ApplicationHelper
  include Pagy::Frontend

  def format_duration(duration = 0)
    Time.at(duration).utc.strftime("%M:%S")
  end
end

require_relative "../terminal/reads_cli"
require "stringio"

class TerminalController < ApplicationController
  skip_before_action :verify_authenticity_token

  def execute
    command, *args = request.raw_post.strip.split

    output = ReadsCLI.execute(command, *args)

    response.headers["Content-Type"] = "text/plain"
    render plain: output
  end
end

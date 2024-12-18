class PagesController < ApplicationController
  def about
  end

  def error
    @a = 1 / 0
  end
end

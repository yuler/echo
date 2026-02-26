class LandingsController < ApplicationController
  allow_unauthenticated_access

  def show
    if authenticated?
    else
      @posts = Post.order(published_at: :desc).limit(10)
      render "home/index"
    end
  end
end

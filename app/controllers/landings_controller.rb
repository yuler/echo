class LandingsController < ApplicationController
  allow_unauthenticated_access

  def show
    @posts = Post.order(published_at: :desc).limit(3)
    render "home/index"
  end
end

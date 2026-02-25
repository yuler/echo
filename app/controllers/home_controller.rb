class HomeController < ApplicationController
  allow_unauthenticated_access

  def index
    @posts = Post.order(published_at: :desc).limit(10)
  end
end

class PostsController < ApplicationController
  allow_unauthenticated_access

  layout "player"

  def index
    @posts = Post.order(published_at: :desc)
  end

  def show
    @post = Post.find(params[:id])
  end
end

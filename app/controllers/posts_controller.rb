class PostsController < ApplicationController
  allow_unauthenticated_access

  def index
    @posts = Post.order(published_at: :desc).page(params[:page])
  end

  def show
    @post = Post.find(params[:id])
  end
end

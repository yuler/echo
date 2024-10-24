class PostsController < ApplicationController
  def index
    @posts = Post.newest.all
  end

  def show
    @post = Post.find_by(slug: params[:slug])
  end
end

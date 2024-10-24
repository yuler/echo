class PostsController < ApplicationController
  def index
    @posts = Post.all
  end

  def show
    @post = Post.newest.find_by(slug: params[:slug])
  end
end

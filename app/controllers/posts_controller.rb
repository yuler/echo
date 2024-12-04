class PostsController < ApplicationController
  include Pagy::Backend

  def index
    @pagy, @posts = pagy_keyset(Post.newest.with_attached_poster, params: ->(params) { params.except!(:limit) })
  end

  def show
    @post = Post.find_by(slug: params[:slug])
  end
end

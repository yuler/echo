class PostsController < ApplicationController
  allow_unauthenticated_access

  def index
    @posts = Post.order(published_at: :desc).page(params[:page])
  end

  def show
    @post = Post.find(params[:id])
  end

  def crawl
    Post.crawl_vira_latest_post
    redirect_back fallback_location: root_path, notice: "Crawled today's post successfully."
  rescue StandardError => e
    redirect_back fallback_location: root_path, alert: "Failed to crawl today's post: #{e.message}"
  end
end

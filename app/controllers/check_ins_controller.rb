class CheckInsController < ApplicationController
  before_action :set_post

  def create
    @check_in = Current.user.check_ins.new(post: @post)

    if @check_in.save
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to @post, notice: "Checked in successfully!" }
      end
    else
      respond_to do |format|
        format.turbo_stream { render turbo_stream: turbo_stream.replace("check_in_button_#{@post.id}", partial: "check_ins/button", locals: { post: @post }), status: :unprocessable_entity }
        format.html { redirect_to @post, alert: "Already checked in or error." }
      end
    end
  end

  private

  def set_post
    @post = Post.find(params[:post_id])
  end
end

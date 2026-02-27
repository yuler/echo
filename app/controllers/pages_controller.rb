class PagesController < ApplicationController
  allow_unauthenticated_access

  def show
    render template: "pages/#{params[:slug]}"
  rescue ActionView::MissingTemplate
    head :not_found
  end
end

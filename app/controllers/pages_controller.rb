class PagesController < ApplicationController
  allow_unauthenticated_access

  PAGES = %w[about changelog].freeze

  def show
    slug = params[:slug].to_s
    return head :not_found unless PAGES.include?(slug)

    render template: "pages/#{slug}"
  rescue ActionView::MissingTemplate
    head :not_found
  end
end

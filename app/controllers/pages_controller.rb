class PagesController < ApplicationController
  def about
    markdown_content = File.read(Rails.root.join("app", "views", "pages", "about.md"))
    renderer = Redcarpet::Render::HTML.new
    markdown = Redcarpet::Markdown.new(renderer, extensions = {})
    @layout_class = "mt-8 prose prose-2xl"
    @about_html = markdown.render(markdown_content)
    render html: @about_html.html_safe, layout: true
  end

  def error
    @a = 1 / 0
  end
end

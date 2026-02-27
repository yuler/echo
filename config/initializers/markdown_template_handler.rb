# Registers a template handler for Markdown so that we can render .html.md files
ActionView::Template.register_template_handler("md.erb", ->(template, source) {
  erb_handler = ActionView::Template.registered_template_handler(:erb)
  compiled_source = erb_handler.call(template, source)

  <<~RUBY
    markdown_content = begin;#{compiled_source};end.to_s
    Commonmarker.to_html(markdown_content, options: { render: { unsafe: true } }).html_safe
  RUBY
})

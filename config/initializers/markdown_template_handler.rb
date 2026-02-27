# Registers a template handler for Markdown so that we can render .html.md files
ActionView::Template.register_template_handler("md.erb", ->(template, source) {
  erb_handler = ActionView::Template.registered_template_handler(:erb)
  compiled_source = erb_handler.call(template, source)

  <<~RUBY
    markdown_content = begin;#{compiled_source};end.to_s
    html = Commonmarker.to_html(markdown_content, options: { render: { unsafe: false } })
    wrapper_top = %q(<div class="container-main pt-10! font-serif prose prose-neutral prose-lg md:prose-xl mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-500 selection:bg-blue-100 selection:text-blue-900">)
    wrapper_bottom = "</div>"
    (wrapper_top + html + wrapper_bottom).html_safe
  RUBY
})

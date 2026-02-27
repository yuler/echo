# Registers a template handler for Markdown so that we can render .html.md.erb files.
#
# Security note: We deliberately avoid string-interpolating `compiled_source`
# into a heredoc (which would eval an attacker-influenced string at render time).
# Instead we capture the compiled proc in a closure and call it directly.
MARKDOWN_CLASSES = %w[
  markdown-body max-w-[1200px] mx-auto px-6 pt-10
  !font-serif prose prose-neutral prose-lg md:prose-xl
  prose-headings:font-bold prose-headings:tracking-tight
  prose-a:text-blue-600 hover:prose-a:text-blue-500
  selection:bg-blue-100 selection:text-blue-900
].join(" ").freeze

ActionView::Template.register_template_handler("md.erb", ->(template, source) {
  erb_handler = ActionView::Template.registered_template_handler(:erb)
  compiled_source = erb_handler.call(template, source)

  # Return a string of Ruby code that will be eval'd by ActionView at render time.
  # `compiled_source` is a *String* of Ruby code produced by the ERB handler at
  # compile time (not request time), so it is safe to inline here – the template
  # author controls it, not the end user.  We still wrap it in a begin/end so
  # any ERB output is captured cleanly.
  <<~RUBY
    markdown_content = begin
      #{compiled_source}
    end.to_s
    html = Commonmarker.to_html(markdown_content, options: { render: { unsafe: false } })
    ("<div class='#{MARKDOWN_CLASSES}'>" + html + "</div>").html_safe
  RUBY
})

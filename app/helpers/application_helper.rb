module ApplicationHelper
  def page_title_tag
    account_name = if Current.account && Current.session&.identity&.users&.many?
      Current.account&.name
    end
    # TODO: Rename
    tag.title [ @page_title, account_name, "Echo" ].compact.join(" | ")
  end

  # Render an SVG file inline so it inherits CSS `color` via `currentColor`.
  #
  # Supports: id, class, style, data, aria, alt, and any other HTML attributes.
  #   - class:  merges with existing SVG classes
  #   - style:  merges with existing inline styles
  #   - data:   accepts a Hash, expanded to data-* attributes
  #   - aria:   accepts a Hash, expanded to aria-* attributes
  #   - alt:    mapped to aria-label for accessibility
  #   - others: set directly as attributes (keys are dasherized)
  #
  # Usage:
  #   inline_svg("play.svg", id: "play-icon", class: "w-4 h-4",
  #     style: "opacity: 0.8;", data: { controller: "icon" },
  #     aria: { hidden: true })
  def inline_svg(filename, options = {})
    file_path = Rails.root.join("app", "assets", "images", Pathname.new(filename).basename.to_s)
    raise "SVG asset not found: #{filename}" unless File.exist?(file_path)

    content = Rails.cache.fetch("inline_svg/#{filename}", skip_nil: true) do
      File.read(file_path)
    end

    doc = Nokogiri::XML(content)
    svg = doc.at_css("svg")
    raise "SVG content in '#{filename}' is invalid or does not contain an svg tag." unless svg

    options.each do |key, value|
      case key.to_s
      when "class"
        existing = svg["class"].to_s
        svg["class"] = [ existing, value ].reject(&:blank?).join(" ")
      when "style"
        svg["style"] = [ svg["style"].to_s, value.to_s ].map { |s| s.chomp(";").strip }.reject(&:blank?).join("; ")
      when "data"
        value.each { |k, v| svg["data-#{k.to_s.dasherize}"] = v.to_s }
      when "aria"
        value.each { |k, v| svg["aria-#{k.to_s.dasherize}"] = v.to_s }
      when "alt"
        svg["aria-label"] = value.to_s if value.present?
      else
        svg[key.to_s.dasherize] = value.to_s
      end
    end

    svg.to_html.html_safe
  end
end

// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"

import "trix"
import "@rails/actiontext"

// is url exist debug=1
!(function () {
  if (!/debug=1/.test(window.location)) return

  var src = '//cdn.jsdelivr.net/npm/eruda'
  var script = document.createElement('script')
  script.src = src;
  script.onload = function () {
    eruda.init();
  };
  document.head.appendChild(script);
})()

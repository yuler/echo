import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    threshold: Number,
    hiddenClass: String
  }

  connect() {
    this.lastScrollTop = 0
  }

  scroll() {
    const currentScroll = window.scrollX || document.documentElement.scrollTop

    // Scrolling down？
    if (currentScroll > this.lastScrollTop && currentScroll > this.thresholdValue) {
      this.element.classList.add(this.hiddenClassValue)
    } else {
      this.element.classList.remove(this.hiddenClassValue)
    }

    this.lastScrollTop = currentScroll
  }
} 
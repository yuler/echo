import { Controller } from "@hotwired/stimulus"
import QRCode from "qrcode"
import { toPng } from "html-to-image"

export default class extends Controller {
  static targets = ["dialog", "preview", "posterTemplate", "qrCodeImg", "loading", "webShareContainer"]
  static values = {
    title: String,
    url: String
  }

  connect() {
    if (navigator.share) {
      if (this.hasWebShareContainerTarget) {
        this.webShareContainerTarget.classList.remove("hidden")
      }
    }
    this.posterGenerated = false
  }

  open() {
    this.dialogTarget.showModal()
    if (!this.posterGenerated) {
      this.generatePoster()
    }
  }

  close() {
    this.dialogTarget.close()
  }

  async webShare() {
    try {
      await navigator.share({
        title: this.titleValue,
        url: this.urlValue
      })
    } catch (err) {
      console.log("Share failed", err)
    }
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.urlValue)
      const btn = this.element.querySelector('[data-action="click->share#copyLink"]')
      if (btn) {
        const originalText = btn.innerHTML
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Copied!`
        setTimeout(() => { btn.innerHTML = originalText }, 2000)
      }
    } catch (err) {
      console.error("Failed to copy", err)
    }
  }

  download() {
    if (!this.posterGenerated) return
    const link = document.createElement('a')
    link.download = `echo-poster-${Date.now()}.png`
    link.href = this.previewTarget.src
    link.click()
  }

  async generatePoster() {
    if (this.hasLoadingTarget) {
      this.loadingTarget.classList.remove("hidden")
    }

    try {
      const qrDataUrl = await QRCode.toDataURL(this.urlValue, {
        width: 400,
        margin: 1,
        color: {
          dark: "#111827",
          light: "#FFFFFF"
        }
      })
      this.qrCodeImgTarget.src = qrDataUrl

      // Ensure images are fully loaded before rendering
      const imgs = Array.from(this.posterTemplateTarget.querySelectorAll("img"))
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve()
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve // proceed even on error
        })
      }))

      const dataUrl = await toPng(this.posterTemplateTarget, {
        pixelRatio: 2,
        backgroundColor: "#ffffff"
      })

      this.previewTarget.src = dataUrl
    } catch (e) {
      console.error("Failed to generate poster", e)
    }

    if (this.hasLoadingTarget) {
      this.loadingTarget.classList.add("hidden")
    }
    this.posterGenerated = true
  }
}

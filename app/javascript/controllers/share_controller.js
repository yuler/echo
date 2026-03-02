import { Controller } from "@hotwired/stimulus"
import QRCode from "qrcode"
import { toPng } from "html-to-image"

export default class extends Controller {
  static targets = ["dialog", "preview", "posterTemplate", "qrCodeImg", "loading", "webShareContainer", "copyDefault", "copySuccess"]
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
      console.error("Share failed", err)
    }
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.urlValue)
      this.copyDefaultTarget.classList.add("hidden")
      this.copySuccessTarget.classList.remove("hidden")
      setTimeout(() => {
        this.copyDefaultTarget.classList.remove("hidden")
        this.copySuccessTarget.classList.add("hidden")
      }, 2000)
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
        backgroundColor: "#ffffff",
        width: 1080,
        height: 1920
      })

      this.previewTarget.src = dataUrl
      this.posterGenerated = true
    } catch (e) {
      console.error("Failed to generate poster", e)
    } finally {
      if (this.hasLoadingTarget) {
        this.loadingTarget.classList.add("hidden")
      }
    }
  }
}

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

  async copyImage() {
    if (!this.posterGenerated) return
    try {
      const response = await fetch(this.previewTarget.src)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])

      this.toggleCopyState(true)
      setTimeout(() => {
        this.toggleCopyState(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy image", err)
    }
  }

  toggleCopyState(showSuccess) {
    const classes = {
      default: { add: "hidden", remove: "inline-flex" },
      success: { add: "inline-flex", remove: "hidden" }
    }

    const defaultAction = showSuccess ? "add" : "remove"
    const successAction = showSuccess ? "remove" : "add"

    this.copyDefaultTarget.classList.remove(classes.default[successAction])
    this.copyDefaultTarget.classList.add(classes.default[defaultAction])
    this.copySuccessTarget.classList.remove(classes.success[successAction])
    this.copySuccessTarget.classList.add(classes.success[defaultAction])
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
      // Allow browser to render loading state before heavy DOM operations block the main thread
      await new Promise(resolve => requestAnimationFrame(resolve))
      await new Promise(resolve => setTimeout(resolve, 50))
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
        width: 1080
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

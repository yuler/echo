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
    this.preloadPosterImages()
  }

  preloadPosterImages() {
    if (!this.hasPosterTemplateTarget) return

    // Silently load images in the background when the page opens
    const imgs = this.posterTemplateTarget.querySelectorAll("img")
    imgs.forEach(img => {
      // Remove lazy loading to trigger download immediately
      if (img.loading === "lazy") {
        img.loading = "eager"
      }

      // Let the browser decode and cache the images
      if (img.src && typeof img.decode === "function") {
        img.decode().catch(() => { })
      }
    })
  }

  async open() {
    if (navigator.share) {
      if (!this.posterGenerated) await this.generatePoster()
      this.webShare()
      return
    }
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
      const shareData = { title: this.titleValue, url: this.urlValue }
      if (this.posterGenerated && this.previewTarget?.src) {
        const res = await fetch(this.previewTarget.src)
        const blob = await res.blob()
        const file = new File([blob], "echo-poster.png", { type: "image/png" })
        shareData.files = [file]
      }
      await navigator.share(shareData)
    } catch (err) {
      if (err.name !== "AbortError") console.error("Share failed", err)
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
    this.copyDefaultTarget.classList.toggle("inline-flex", !showSuccess);
    this.copyDefaultTarget.classList.toggle("hidden", showSuccess);
    this.copySuccessTarget.classList.toggle("inline-flex", showSuccess);
    this.copySuccessTarget.classList.toggle("hidden", !showSuccess);
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
        if (img.loading === "lazy") img.loading = "eager"

        // Use native decode API for robust load checking
        if (img.src && typeof img.decode === "function") {
          return img.decode().catch(() => { }) // proceed even if one image fails
        }

        // Fallback for older browsers
        if (img.complete) return Promise.resolve()
        return new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
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

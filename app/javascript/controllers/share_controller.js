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
  }

  posterTemplateTargetConnected() {
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
      const blob = this.dataURLToBlob(this.previewTarget.src)
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
      alert("Copy failed: " + (err.message || err))
    }
  }

  toggleCopyState(showSuccess) {
    this.copyDefaultTarget.classList.toggle("inline-flex", !showSuccess);
    this.copyDefaultTarget.classList.toggle("hidden", showSuccess);
    this.copySuccessTarget.classList.toggle("inline-flex", showSuccess);
    this.copySuccessTarget.classList.toggle("hidden", !showSuccess);
  }

  async download() {
    if (!this.posterGenerated) return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

    if (isIOS && isPWA && navigator.canShare) {
      try {
        const blob = this.dataURLToBlob(this.previewTarget.src)
        const file = new File([blob], `echo-poster-${Date.now()}.png`, { type: blob.type })
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file]
          })
          return
        }
      } catch (e) {
        console.error("Share API failed, falling back to download", e)
      }
    }

    try {
      const blob = this.dataURLToBlob(this.previewTarget.src)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `echo-poster-${Date.now()}.png`
      link.href = url
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (e) {
      console.error("Download failed, falling back to data URL", e)
      const link = document.createElement('a')
      link.download = `echo-poster-${Date.now()}.png`
      link.href = this.previewTarget.src
      link.click()
    }
  }

  dataURLToBlob(dataUrl) {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
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
        width: 1080,
        cacheBust: true,
        fetchRequestInit: {
          cache: "no-cache"
        }
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

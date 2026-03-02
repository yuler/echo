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

      this.showToast("Poster image copied successfully!")

      this.copyDefaultTarget.classList.add("hidden")
      this.copyDefaultTarget.classList.remove("inline-flex")
      this.copySuccessTarget.classList.remove("hidden")
      this.copySuccessTarget.classList.add("inline-flex")
      setTimeout(() => {
        this.copyDefaultTarget.classList.remove("hidden")
        this.copyDefaultTarget.classList.add("inline-flex")
        this.copySuccessTarget.classList.add("hidden")
        this.copySuccessTarget.classList.remove("inline-flex")
      }, 2000)
    } catch (err) {
      console.error("Failed to copy image", err)
      this.showToast("Failed to copy image")
    }
  }

  showToast(message) {
    const toast = document.createElement("div")
    toast.className = "fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 bg-neutral-900 border border-neutral-800 text-white rounded-xl shadow-2xl font-medium text-sm transition-all duration-300 transform translate-y-0 opacity-100"

    toast.innerHTML = `
      <svg class="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `
    // Append to dialog so it is part of the top layer, rendering over the overlay.
    if (this.hasDialogTarget && this.dialogTarget.open) {
      this.dialogTarget.appendChild(toast)
    } else {
      document.body.appendChild(toast)
    }

    // Trigger appear animation
    requestAnimationFrame(() => {
      toast.style.transform = "translate(-50%, 0)"
    })

    setTimeout(() => {
      toast.classList.add("opacity-0", "-translate-y-4")
      setTimeout(() => toast.remove(), 300)
    }, 2500)
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

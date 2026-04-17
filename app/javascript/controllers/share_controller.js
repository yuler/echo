import { Controller } from "@hotwired/stimulus"
import QRCode from "qrcode"
import { toPng } from "html-to-image"

export default class extends Controller {
  static targets = ["dialog", "preview", "posterTemplate", "qrCodeImg", "loading", "webShareContainer", "copyDefault", "copySuccess", "downloadBtn", "shareBtn"]
  static values = {
    title: String,
    url: String
  }

  connect() {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone

    if (isPWA) {
      if (this.hasDownloadBtnTarget) this.downloadBtnTarget.classList.add("hidden")
      if (this.hasShareBtnTarget) this.shareBtnTarget.classList.remove("hidden")

      // Hide the extra "Share via Device" in PWA mode since we already have the main share button
      if (this.hasWebShareContainerTarget) {
        this.webShareContainerTarget.classList.add("hidden")
      }
    } else {
      if (this.hasDownloadBtnTarget) this.downloadBtnTarget.classList.remove("hidden")
      if (this.hasShareBtnTarget) this.shareBtnTarget.classList.add("hidden")

      if (navigator.share && this.hasWebShareContainerTarget) {
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

  async shareFile() {
    if (!this.posterGenerated) return

    try {
      const blob = this.dataURLToBlob(this.previewTarget.src)
      const file = new File([blob], `echo-poster-${Date.now()}.png`, { type: blob.type })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file]
        })
      } else {
        // Fallback to download if sharing file is not supported
        this.download()
      }
    } catch (e) {
      console.error("Share API failed, falling back to download", e)
      this.download()
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

      await Promise.all(imgs.map(async img => {
        if (img.loading === "lazy") img.loading = "eager"

        // Wait for image to load using decode or onload
        if (img.src && typeof img.decode === "function" && !img.src.startsWith("data:")) {
          try {
            await img.decode()
          } catch (e) {
            console.warn("Image decode failed", e)
          }
        } else if (!img.complete && !img.src.startsWith("data:")) {
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
        }

        // Fix for iOS PWA Wi-Fi bug: fetch image as blob and convert to base64
        // to avoid canvas tainting and html-to-image fetch issues
        if (img.src && !img.src.startsWith("data:")) {
          try {
            // Fetch with cache busting to prevent Safari PWA Wi-Fi cache bugs
            const fetchUrl = img.src + (img.src.includes('?') ? '&' : '?') + 'cb=' + Date.now();
            const response = await fetch(fetchUrl, { mode: 'cors', cache: 'no-cache' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();

            const reader = new FileReader();
            await new Promise((resolve, reject) => {
              reader.onloadend = () => {
                img.src = reader.result;
                img.removeAttribute("crossorigin");
                resolve();
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.warn("Failed to fetch image, falling back to canvas", e);
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || img.width || 1080;
              canvas.height = img.naturalHeight || img.height || 1080;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              img.src = canvas.toDataURL("image/png");
              img.removeAttribute("crossorigin");
            } catch (canvasErr) {
              console.warn("Failed to convert image via canvas as well", canvasErr);
            }
          }
        }
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

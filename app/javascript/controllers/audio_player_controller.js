import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "audio", "sentence", "translation",
    "playIcon", "pauseIcon", "progress", "progressBar", "progressInner",
    "currentTime", "totalTime", "speedBtn",
    "simpleBtn", "explanationBtn", "toggleIndicator", "header"
  ]

  static values = {
    speed: { type: Number, default: 1 },
    simpleUrl: String,
    explanationUrl: String
  }

  connect() {
    this.currentMode = "simple"
    this.boundSync = this.sync.bind(this)

    const audio = this.audioTarget
    audio.addEventListener("timeupdate", this.boundSync)
    audio.addEventListener("loadedmetadata", () => this.updateTotalTime())
    audio.addEventListener("play", () => this.showPauseIcon())
    audio.addEventListener("pause", () => this.showPlayIcon())
    audio.addEventListener("ended", () => this.showPlayIcon())

    this.syncWaveformWidth()
    this.boundResize = this.syncWaveformWidth.bind(this)
    window.addEventListener("resize", this.boundResize)
  }

  disconnect() {
    this.audioTarget.removeEventListener("timeupdate", this.boundSync)
    window.removeEventListener("resize", this.boundResize)
  }

  togglePlay() {
    if (this.audioTarget.paused) {
      this.audioTarget.play()
    } else {
      this.audioTarget.pause()
    }
  }

  rewind() {
    this.audioTarget.currentTime = Math.max(0, this.audioTarget.currentTime - 15)
  }

  forward() {
    this.audioTarget.currentTime = Math.min(
      this.audioTarget.duration,
      this.audioTarget.currentTime + 15
    )
  }

  seek(event) {
    if (this.currentMode === "explanation") return
    const time = parseFloat(event.currentTarget.dataset.time)
    this.audioTarget.currentTime = time
    if (this.audioTarget.paused) this.audioTarget.play()
  }

  scrub(event) {
    const rect = this.progressBarTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    this.audioTarget.currentTime = ratio * this.audioTarget.duration
  }

  setSpeed(event) {
    const speed = parseFloat(event.currentTarget.dataset.speed)
    this.audioTarget.playbackRate = speed
    this.speedBtnTargets.forEach(btn => {
      btn.classList.toggle("active", parseFloat(btn.dataset.speed) === speed)
    })
  }

  toggleTranslation() {
    this.translationTargets.forEach(el => el.classList.toggle("hidden"))
  }

  switchToSimple() {
    if (!this.hasSimpleUrlValue) return
    this._switchAudio(this.simpleUrlValue)
    this._setActiveMode("simple")
  }

  switchToExplanation() {
    if (!this.hasExplanationUrlValue) return
    this._switchAudio(this.explanationUrlValue)
    this._setActiveMode("explanation")
  }

  _switchAudio(url) {
    const audio = this.audioTarget
    const wasPlaying = !audio.paused
    audio.pause()
    audio.src = url
    audio.load()
    audio.currentTime = 0
    if (this.hasProgressTarget) this.progressTarget.style.width = "0%"
    if (this.hasCurrentTimeTarget) this.currentTimeTarget.textContent = "0:00"
    audio.addEventListener("loadedmetadata", () => {
      this.updateTotalTime()
      if (wasPlaying) audio.play().catch(() => { })
    }, { once: true })
  }

  _setActiveMode(mode) {
    this.currentMode = mode
    if (this.hasSimpleBtnTarget && this.hasExplanationBtnTarget) {
      const simpleBtn = this.simpleBtnTarget
      const expBtn = this.explanationBtnTarget

      if (mode === "simple") {
        simpleBtn.classList.add("text-white")
        simpleBtn.classList.remove("text-neutral-500")
        expBtn.classList.remove("text-white")
        expBtn.classList.add("text-neutral-500")
        if (this.hasToggleIndicatorTarget) {
          this.toggleIndicatorTarget.style.transform = "translateX(0)"
        }
      } else {
        expBtn.classList.add("text-white")
        expBtn.classList.remove("text-neutral-500")
        simpleBtn.classList.remove("text-white")
        simpleBtn.classList.add("text-neutral-500")
        if (this.hasToggleIndicatorTarget) {
          this.toggleIndicatorTarget.style.transform = "translateX(100%)"
        }
      }
    }
  }

  sync() {
    const currentTime = this.audioTarget.currentTime
    const duration = this.audioTarget.duration || 1
    this.updateProgress(currentTime, duration)
    this.updateTimeDisplay(currentTime)
    this.highlightSentences(currentTime)
  }

  updateProgress(currentTime, duration) {
    if (!this.hasProgressTarget) return
    const pct = (currentTime / duration) * 100
    this.progressTarget.style.width = `${pct}%`
  }

  syncWaveformWidth() {
    if (!this.hasProgressInnerTarget || !this.hasProgressBarTarget) return
    const fullWidth = this.progressBarTarget.offsetWidth
    this.progressInnerTarget.style.width = `${fullWidth}px`
  }

  updateTimeDisplay(currentTime) {
    if (!this.hasCurrentTimeTarget) return
    this.currentTimeTarget.textContent = this.formatTime(currentTime)
  }

  updateTotalTime() {
    if (!this.hasTotalTimeTarget) return
    this.totalTimeTarget.textContent = this.formatTime(this.audioTarget.duration)
  }

  highlightSentences(currentTime) {
    if (this.currentMode === "explanation") {
      this.sentenceTargets.forEach(sentence => {
        sentence.classList.remove("sentence-active", "sentence-past", "sentence-inactive", "cursor-pointer")
        sentence.classList.add("sentence-explanation")
      })
      return
    }

    let activeIndex = -1

    this.sentenceTargets.forEach((sentence, index) => {
      sentence.classList.add("cursor-pointer")
      sentence.classList.remove("sentence-explanation") // Ensure explanation mode class is removed

      const time = parseFloat(sentence.dataset.time)
      const nextTime = this.sentenceTargets[index + 1]
        ? parseFloat(this.sentenceTargets[index + 1].dataset.time)
        : Infinity

      if (currentTime >= time && currentTime < nextTime) {
        activeIndex = index
        sentence.classList.add("sentence-active")
        sentence.classList.remove("sentence-past", "sentence-inactive")
      } else if (currentTime >= nextTime) {
        sentence.classList.add("sentence-past")
        sentence.classList.remove("sentence-active", "sentence-inactive")
      } else {
        sentence.classList.add("sentence-inactive")
        sentence.classList.remove("sentence-active", "sentence-past")
      }
    })

    this.scrollToActive(activeIndex)
  }



  scrollToActive(activeIndex) {
    if (activeIndex === -1 || activeIndex === this.lastActiveIndex) return
    this.lastActiveIndex = activeIndex

    const sentence = this.sentenceTargets[activeIndex]
    const headerHeight = this.hasHeaderTarget ? this.headerTarget.offsetHeight : 0
    const styles = getComputedStyle(document.documentElement)
    const padding = parseInt(styles.getPropertyValue("--audio-scroll-padding")) || 80
    const playerHeight = parseInt(styles.getPropertyValue("--audio-player-height")) || 40

    const rect = sentence.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const sentenceTop = rect.top + window.scrollY

    if (rect.top < padding || rect.bottom > viewportHeight - headerHeight - playerHeight) {
      window.scrollTo({
        top: sentenceTop - padding,
        behavior: "smooth"
      })
    }
  }

  showPlayIcon() {
    if (this.hasPlayIconTarget) this.playIconTarget.classList.remove("hidden")
    if (this.hasPauseIconTarget) this.pauseIconTarget.classList.add("hidden")
  }

  showPauseIcon() {
    if (this.hasPlayIconTarget) this.playIconTarget.classList.add("hidden")
    if (this.hasPauseIconTarget) this.pauseIconTarget.classList.remove("hidden")
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }
}

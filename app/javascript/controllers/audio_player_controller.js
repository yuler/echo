import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "audio", "sentence", "word", "translation",
    "playIcon", "pauseIcon", "progress", "progressBar", "progressInner",
    "currentTime", "totalTime", "speedBtn",
    "simpleBtn", "explanationBtn"
  ]

  static values = {
    speed: { type: Number, default: 1 },
    simpleUrl: String,
    explanationUrl: String
  }

  connect() {
    this.speeds = [0.75, 1, 1.25, 1.5, 2]
    this.speedIndex = 1
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

    audio.play().catch(() => { })
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
    const time = parseFloat(event.currentTarget.dataset.time)
    this.audioTarget.currentTime = time
    if (this.audioTarget.paused) this.audioTarget.play()
  }

  scrub(event) {
    const rect = this.progressBarTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    this.audioTarget.currentTime = ratio * this.audioTarget.duration
  }

  cycleSpeed() {
    this.speedIndex = (this.speedIndex + 1) % this.speeds.length
    const speed = this.speeds[this.speedIndex]
    this.audioTarget.playbackRate = speed
    this.speedBtnTarget.textContent = speed === 1 ? "1x" : `${speed}x`
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
    const activeClasses = ["bg-neutral-900", "text-white"]
    const inactiveClasses = ["text-neutral-500", "hover:bg-neutral-100"]

    if (this.hasSimpleBtnTarget && this.hasExplanationBtnTarget) {
      const simpleBtn = this.simpleBtnTarget
      const expBtn = this.explanationBtnTarget

      if (mode === "simple") {
        simpleBtn.classList.add(...activeClasses)
        simpleBtn.classList.remove(...inactiveClasses)
        expBtn.classList.remove(...activeClasses)
        expBtn.classList.add(...inactiveClasses)
      } else {
        expBtn.classList.add(...activeClasses)
        expBtn.classList.remove(...inactiveClasses)
        simpleBtn.classList.remove(...activeClasses)
        simpleBtn.classList.add(...inactiveClasses)
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
    let activeIndex = -1

    this.sentenceTargets.forEach((sentence, index) => {
      const time = parseFloat(sentence.dataset.time)
      const nextTime = this.sentenceTargets[index + 1]
        ? parseFloat(this.sentenceTargets[index + 1].dataset.time)
        : Infinity

      if (currentTime >= time && currentTime < nextTime) {
        activeIndex = index
        sentence.style.opacity = "1"
      } else if (currentTime >= nextTime) {
        sentence.style.opacity = "0.7"
      } else {
        sentence.style.opacity = "0.3"
      }
    })

    this.highlightWords(activeIndex, currentTime)
    this.scrollToActive(activeIndex)
  }

  highlightWords(activeIndex, currentTime) {
    this.wordTargets.forEach(w => {
      w.style.backgroundColor = ""
      w.style.color = ""
    })

    if (activeIndex === -1) return

    const sentence = this.sentenceTargets[activeIndex]
    const words = sentence.querySelectorAll('[data-audio-player-target="word"]')
    if (!words.length) return

    const sentenceStart = parseFloat(sentence.dataset.time)
    const nextSentence = this.sentenceTargets[activeIndex + 1]
    const sentenceEnd = nextSentence
      ? parseFloat(nextSentence.dataset.time)
      : sentenceStart + 5

    const progress = (currentTime - sentenceStart) / (sentenceEnd - sentenceStart)
    const highlightCount = Math.ceil(progress * words.length)

    words.forEach((word, i) => {
      if (i < highlightCount) {
        word.style.backgroundColor = "#fef9c3"
        word.style.color = "#111"
      }
    })
  }

  scrollToActive(activeIndex) {
    if (activeIndex === -1 || activeIndex === this.lastActiveIndex) return
    this.lastActiveIndex = activeIndex

    const sentence = this.sentenceTargets[activeIndex]
    const headerHeight = this.hasHeaderTarget ? this.headerTarget.offsetHeight : 0
    const padding = 80 // Top padding for visibility

    const rect = sentence.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const sentenceTop = rect.top + window.scrollY

    // Player is now at bottom, so check if sentence is too close to top or bottom
    if (rect.top < padding || rect.bottom > viewportHeight - headerHeight - 40) {
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

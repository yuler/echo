import { Controller } from '@hotwired/stimulus'
import { nextEventLoopTick, throttle } from 'helpers/timing_helpers'
import { readCookie, setCookie } from "helpers/cookie_helpers"

// Connects to data-controller="audio-player"
export default class extends Controller {
  connect() {
    this.dragging = false;
    this.offsetX = 0
  }

  static targets = [
    'playButton',
    'playerElement',
    'audioElement',
    'sourceElement',
    'playerProgressTrack',
    'playerProgress',
    'playerStepBack',
    'playerStepForward',
    'playerPlayButton',
    'playerTitle',
    'playerCurrentTime',
    'playerTotalTime',
    'playerKnob'
  ]

  static values = {
    id: String,
  }

  error(event) {
    window.alert(JSON.stringify(event))
  }

  setup() {
    this.playerElementTarget.classList.remove('player--hidden')
    setTimeout(() => {
      this.playerElementTarget.classList.add('player--visible')
    }, 50)

    const progress = readCookie(this.#progressCookieName)
    if (progress) {
      if (window.confirm(`Last progress: ${this.#formatSeconds(progress)}, continue?`)) {
        this.audioElementTarget.currentTime = progress
      }
    }
  }

  load() {
    this.playerTotalTimeTarget.innerText = this.#formatSeconds(this.audioElementTarget.duration)
  }
  update() {
    let r = (this.audioElementTarget.currentTime / this.audioElementTarget.duration) * 100
    this.playerProgressTarget.style.width = `${r}%`
    this.playerKnobTarget.style.left = `${r}%`
    this.playerCurrentTimeTarget.textContent = this.#formatSeconds(this.audioElementTarget.currentTime)

    // Save progress to cookie
    setCookie(this.#progressCookieName, Math.trunc(this.audioElementTarget.currentTime), 7)
  }

  // drag
  down(event) {
    this.dragging = true
    const rect = this.playerKnobTarget.getBoundingClientRect()
    this.offsetX = event.clientX - rect.left
    document.body.style.cursor = 'grabbing'
  }
  up() {
    this.dragging = false
    document.body.style.cursor = 'default'
  }
  move(event) {
    if (!this.dragging) return

    this.playerKnobTarget.style.left = (event.clientX - this.offsetX) + 'px'
    this.audioElementTarget.currentTime = (event.clientX - this.offsetX) / this.playerProgressTrackTarget.clientWidth * this.audioElementTarget.duration
  }
  seek() { }

  updateControls() {
    if (this.audioElementTarget.paused) {
      this.playerPlayButtonTarget.classList.remove("player__play--playing")
    } else {
      this.playerPlayButtonTarget.classList.add("player__play--playing")
    }
  }

  // Actions
  play(event) {
    event.preventDefault()
    event.stopImmediatePropagation()
    if (this.playButtonTarget.href == this.sourceElementTarget.src) {
      this.togglePlayPause()
    } else {
      this.playerTitleTarget.textContent = this.playButtonTarget.title
      this.sourceElementTarget.src = this.playButtonTarget.href
      this.audioElementTarget.load()
    }
  }
  togglePlayPause() {
    if (this.audioElementTarget.paused) {
      this.playerPlayButtonTarget.classList.add("player__play--playing")
      this.audioElementTarget.play()
    } else {
      this.playerPlayButtonTarget.classList.remove("player__play--playing")
      this.audioElementTarget.pause()
    }
  }
  stepBack() {
    this.audioElementTarget.currentTime -= 10
  }
  stepForward() {
    this.audioElementTarget.currentTime += 10
  }

  get #exist() {
    this.playerElementTarget?.classList.contains('player--visible')
  }

  get #progressCookieName() {
    return `audio_player_progress_id_${this.idValue}`
  }

  #formatSeconds(duration) {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

import { Controller } from '@hotwired/stimulus'
import { nextEventLoopTick } from 'helpers/timing_helpers'

// Connects to data-controller="audio-player"
export default class extends Controller {
  connect() {
    console.log('player controller connected', this)
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
  ]

  error(event) {
    window.alert(JSON.stringify(event))
  }

  setup() {
    this.playerElementTarget.classList.remove('player--hidden')
    setTimeout(() => {
      this.playerElementTarget.classList.add('player--visible')
    }, 50)
  }

  load() {
    this.playerTotalTimeTarget.innerText = this.#formatSeconds(this.audioElementTarget.duration)
  }
  update() {
    let r = (this.audioElementTarget.currentTime / this.audioElementTarget.duration) * 100
    this.playerProgressTarget.style.width = `${r}%`
    this.playerCurrentTimeTarget.textContent = this.#formatSeconds(this.audioElementTarget.currentTime)
  }
  updateAllPlayControls() { }
  // drag
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

  #formatSeconds(duration) {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
}

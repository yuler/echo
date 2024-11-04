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

  setup() {
    this.playerTotalTimeTarget.innerText = this.#formatSeconds(this.audioElementTarget.duration)
    // this.playerTitleTarget.innerText = this.sourceElementTarget.dataset.title

    this.playerElementTarget.classList.remove('player--hidden')
    setTimeout(() => {
      this.playerElementTarget.classList.add('player--visible')
      // this.togglePlayPause()
    }, 50)
  }
  update() {
    let r = (this.audioElementTarget.currentTime / this.audioElementTarget.duration) * 100
    this.playerProgressTarget.style.width = `${r}%`
    this.playerCurrentTimeTarget.textContent = this.#formatSeconds(this.audioElementTarget.currentTime)
  }
  updateAllPlayControls() { }
  // drag
  seek() { }


  async playButtonTargetConnected() {
    await nextEventLoopTick()
    if (this.#exist) return

    this.playerTitleTarget.textContent = this.playButtonTarget.title
    this.sourceElementTarget.src = this.playButtonTarget.href
    this.audioElementTarget.load()
  }

  // Actions
  // play(event) {
  //   event.preventDefault()
  //   event.stopImmediatePropagation()
  //   if (this.playButtonTarget.href == this.sourceElementTarget.src) {
  //     this.togglePlayPause()
  //   } else {
  //     this.playerTitleTarget.textContent = this.playButtonTarget.title
  //     this.sourceElementTarget.src = this.playButtonTarget.href
  //     this.audioElementTarget.load()
  //   }
  // }
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
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
}

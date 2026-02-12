import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["audio", "sentence", "word", "translation", "header"]

  connect() {
    this.audioTarget.addEventListener("timeupdate", this.sync.bind(this))
  }

  disconnect() {
    this.audioTarget.removeEventListener("timeupdate", this.sync.bind(this))
  }

  seek(event) {
    const time = parseFloat(event.currentTarget.dataset.time)
    this.audioTarget.currentTime = time
    this.audioTarget.play()
  }

  toggleTranslation() {
    this.translationTargets.forEach(el => {
      el.classList.toggle("hidden")
    })
  }

  sync() {
    const currentTime = this.audioTarget.currentTime
    let activeSentenceIndex = -1

    // Find the current sentence
    this.sentenceTargets.forEach((sentence, index) => {
      const time = parseFloat(sentence.dataset.time)
      const nextTime = this.sentenceTargets[index + 1]
        ? parseFloat(this.sentenceTargets[index + 1].dataset.time)
        : Infinity

      if (currentTime >= time && currentTime < nextTime) {
        activeSentenceIndex = index
        sentence.classList.add("opacity-100")
        sentence.classList.remove("opacity-40")
      } else {
        sentence.classList.add("opacity-40")
        sentence.classList.remove("opacity-100")
      }
    })

    // Simulate word-by-word highlighting (simplified for mock data)
    // In a real app, each word would have an exact timestamp.
    // Here we just highlight the whole sentence words when active.
    if (activeSentenceIndex !== -1) {
      // Logic to highlight words could be more complex with real timestamps
      // For now, let's just highlight the words in the active sentence
      const activeSentence = this.sentenceTargets[activeSentenceIndex]
      const wordsInSentence = activeSentence.querySelectorAll('[data-audio-player-target="word"]')

      // Calculate progress within the sentence to highlight words progressively
      const sentenceStartTime = parseFloat(activeSentence.dataset.time)
      const nextTime = this.sentenceTargets[activeSentenceIndex + 1]
        ? parseFloat(this.sentenceTargets[activeSentenceIndex + 1].dataset.time)
        : sentenceStartTime + 5 // assume 5 seconds if last

      const duration = nextTime - sentenceStartTime
      const progress = (currentTime - sentenceStartTime) / duration
      const wordsCount = wordsInSentence.length
      const wordsToHighlight = Math.ceil(progress * wordsCount)

      wordsInSentence.forEach((word, index) => {
        if (index < wordsToHighlight) {
          word.classList.add("bg-yellow-200", "text-black")
        } else {
          word.classList.remove("bg-yellow-200", "text-black")
        }
      })
    }
  }
}

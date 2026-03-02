import { Controller } from "@hotwired/stimulus"
import confetti from "canvas-confetti"

export default class extends Controller {
  static values = {
    audioUrl: String,
    disableAudio: Boolean
  }

  connect() {
    this.fire()
    if (!this.disableAudioValue) {
      this.playAudio()
    }
  }

  fire() {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  }

  playAudio() {
    // Basic fallback audio if no url provided, but try url first.
    try {
      if (this.hasAudioUrlValue && this.audioUrlValue.trim() !== "") {
        const audio = new Audio(this.audioUrlValue)
        audio.play().catch(e => console.error("Audio playback failed", e))
      } else {
        // synthesize simple chime
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.type = "sine"
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.5)
      }
    } catch (e) {
      console.log("Audio not supported or disabled")
    }
  }
}

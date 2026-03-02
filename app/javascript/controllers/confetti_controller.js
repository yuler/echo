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
    const defaults = { startVelocity: 45, spread: 70, ticks: 80, zIndex: 100 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    this.interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(this.interval);
      }

      const particleCount = 40 * (timeLeft / duration);
      const y = randomInRange(0.5, 0.8);

      // Left side fires inward (angle 60° = upper-right direction)
      confetti(Object.assign({}, defaults, {
        particleCount,
        angle: 60,
        origin: { x: 0, y }
      }));

      // Right side fires inward (angle 120° = upper-left direction)
      confetti(Object.assign({}, defaults, {
        particleCount,
        angle: 120,
        origin: { x: 1, y }
      }));
    }, 250);
  }

  disconnect() {
    if (this.interval) {
      clearInterval(this.interval);
    }
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

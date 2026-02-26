import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="background-wave"
export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.canvas = this.canvasTarget
    this.ctx = this.canvas.getContext('2d')
    this.animationId = null
    this.time = 0

    // Audio wave patterns
    this.wavePoints = this.generateWavePoints()

    // Water droplets
    this.droplets = this.generateDroplets()

    // Performance optimization
    this.resize()
    this.boundResize = this.resize.bind(this)
    window.addEventListener('resize', this.boundResize)

    this.start()
  }

  disconnect() {
    this.stop()
    window.removeEventListener('resize', this.boundResize)
  }

  generateWavePoints() {
    // Generate random amplitudes for more natural wave movement
    const points = []
    for (let i = 0; i < 100; i++) {
      points.push({
        base: Math.random(),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.8
      })
    }
    return points
  }

  generateDroplets() {
    const droplets = []
    for (let i = 0; i < 5; i++) {
      droplets.push({
        x: Math.random(),
        y: 0.3 + Math.random() * 0.4,
        radius: 0,
        maxRadius: 0.1 + Math.random() * 0.15,
        opacity: 0.4 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3
      })
    }
    return droplets
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()

    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr

    this.ctx.scale(dpr, dpr)

    this.width = rect.width
    this.height = rect.height
  }

  start() {
    this.animate()
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  animate() {
    this.time += 0.008  // Slower animation
    this.draw()
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  draw() {
    const ctx = this.ctx
    const { width, height } = this

    // Clear with light gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#fefefe')
    gradient.addColorStop(0.5, '#fdfdfd')
    gradient.addColorStop(1, '#f8f8f8')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.save()

    // Draw circular water droplet ripples
    this.drawWaterDroplets(ctx, width, height)

    // Draw multiple audio wave layers
    this.drawAudioWaveform(ctx, width, height, 0.25, 'rgba(220, 224, 228, 0.3)', 1.5)
    this.drawAudioWaveform(ctx, width, height, 0.4, 'rgba(230, 234, 238, 0.25)', 1.8)
    this.drawAudioWaveform(ctx, width, height, 0.55, 'rgba(235, 239, 243, 0.2)', 2.2)
    this.drawAudioWaveform(ctx, width, height, 0.7, 'rgba(240, 244, 248, 0.15)', 2.5)

    // Draw frequency bars at bottom - darker
    this.drawFrequencyBars(ctx, width, height)

    ctx.restore()
  }

  drawAudioWaveform(ctx, width, height, yPosRatio, color, strokeWidth) {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const baseY = height * yPosRatio
    const segments = 40
    const segmentWidth = width / segments

    for (let i = 0; i <= segments; i++) {
      const x = i * segmentWidth
      const point = this.wavePoints[i % this.wavePoints.length]

      // Gentle wave
      const y = baseY +
        Math.sin(x * 0.005 + this.time * point.speed * 0.5 + point.phase) * 15 * point.base +
        Math.sin(x * 0.01 + this.time * point.speed * 0.7 + point.phase) * 8 * point.base +
        Math.sin(x * 0.002 + this.time * point.speed * 0.3 + point.phase) * 5 * point.base

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        // Smooth curve using quadratic bezier
        const prevX = (i - 1) * segmentWidth
        const prevPoint = this.wavePoints[(i - 1) % this.wavePoints.length]
        const prevY = baseY +
          Math.sin(prevX * 0.005 + this.time * prevPoint.speed * 0.5 + prevPoint.phase) * 15 * prevPoint.base +
          Math.sin(prevX * 0.01 + this.time * prevPoint.speed * 0.7 + prevPoint.phase) * 8 * prevPoint.base +
          Math.sin(prevX * 0.002 + this.time * prevPoint.speed * 0.3 + prevPoint.phase) * 5 * prevPoint.base

        const cpX = (prevX + x) / 2
        const cpY = (prevY + y) / 2
        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY)
      }
    }
    ctx.stroke()
  }

  drawFrequencyBars(ctx, width, height) {
    const barCount = 50
    const barSpacing = width / barCount
    const baseHeight = height * 0.12

    for (let i = 0; i < barCount; i++) {
      const point = this.wavePoints[i % this.wavePoints.length]
      const x = i * barSpacing

      // Dynamic bar height
      const barHeight = baseHeight * (0.4 + point.base * 0.6) *
        (0.5 + Math.sin(this.time * point.speed * 1.2 + point.phase) * 0.25)

      const barY = height - barHeight

      // Darker gradient
      const barGradient = ctx.createLinearGradient(x, barY, x, height)
      barGradient.addColorStop(0, 'rgba(180, 185, 190, 0.45)')
      barGradient.addColorStop(1, 'rgba(200, 205, 210, 0.15)')

      ctx.fillStyle = barGradient
      ctx.fillRect(x + 1, barY, barSpacing - 2, barHeight)
    }
  }

  drawWaterDroplets(ctx, width, height) {
    for (const droplet of this.droplets) {
      const centerX = width * droplet.x
      const centerY = height * droplet.y

      // Expanding radius
      const radius = (Math.sin(this.time * droplet.speed + droplet.phase) * 0.5 + 0.5) *
        width * droplet.maxRadius

      // Fading opacity
      const opacity = droplet.opacity * (Math.cos(this.time * droplet.speed + droplet.phase) * 0.5 + 0.5)

      ctx.beginPath()
      ctx.strokeStyle = `rgba(200, 210, 220, ${opacity})`
      ctx.lineWidth = 1.5
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.stroke()

      // Inner ripple
      if (radius > 30) {
        ctx.beginPath()
        ctx.strokeStyle = `rgba(210, 220, 230, ${opacity * 0.6})`
        ctx.lineWidth = 1
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }
}

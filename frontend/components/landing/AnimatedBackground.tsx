"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Resize canvas to fill screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create particles
    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      angle: number
      floatSpeed: number
    }> = []

    // Generate 150 random particles with smooth floating motion
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 6 + 3, // Size between 3-9px
        speedX: (Math.random() - 0.5) * 0.3, // Slower horizontal drift
        speedY: (Math.random() - 0.5) * 0.3, // Slower vertical drift
        opacity: Math.random() * 0.6 + 0.4, // Opacity between 0.4-1.0
        angle: Math.random() * Math.PI * 2, // Random starting angle for sine wave
        floatSpeed: Math.random() * 0.02 + 0.01, // Speed of sine wave oscillation
      })
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // Update angle for smooth floating motion
        particle.angle += particle.floatSpeed
        
        // Add sine wave motion for smooth floating effect
        const floatX = Math.sin(particle.angle) * 2
        const floatY = Math.cos(particle.angle * 0.8) * 2
        
        // Move particle with drift + floating
        particle.x += particle.speedX + floatX * 0.1
        particle.y += particle.speedY + floatY * 0.1

        // Wrap around edges for seamless movement
        if (particle.x < -20) particle.x = canvas.width + 20
        if (particle.x > canvas.width + 20) particle.x = -20
        if (particle.y < -20) particle.y = canvas.height + 20
        if (particle.y > canvas.height + 20) particle.y = -20

        // Draw particle with glow effect - using #11DFFF cyan color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        // Create radial gradient for glow (increased glow size)
        const gradient = ctx.createRadialGradient(
          particle.x, 
          particle.y, 
          0, 
          particle.x, 
          particle.y, 
          particle.size * 4 // Increased glow radius from 2 to 4
        )
        gradient.addColorStop(0, `rgba(17, 223, 255, ${particle.opacity})`) // #11DFFF cyan color
        gradient.addColorStop(0.5, `rgba(17, 223, 255, ${particle.opacity * 0.5})`) // Mid glow
        gradient.addColorStop(1, `rgba(17, 223, 255, 0)`)
        
        ctx.fillStyle = gradient
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />
}

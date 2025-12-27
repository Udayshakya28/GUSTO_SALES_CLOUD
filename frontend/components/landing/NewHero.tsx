"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import Link from "next/link"

export function NewHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
    }> = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2)
        gradient.addColorStop(0, `rgba(94, 214, 231, ${particle.opacity})`)
        gradient.addColorStop(1, `rgba(94, 214, 231, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mb-12 inline-block">
          <span className="text-sm font-medium text-primary px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            {"AI-Powered Lead Generation"}
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance">
          <span style={{ color: "#11FEFF" }}>
            {"AI that turns social signals"}
            <br />
            {"into real customers"}
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          {"Get qualified leads with AI-generated responses. No more scrolling through endless threads."}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8" asChild>
            <Link href="/sign-up">{"Get started for free"}</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-secondary bg-transparent"
            asChild
          >
            <Link href="#pricing">{"See plans & pricing"}</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {"Already have Reddit leads? "}
          <Link href="/dashboard" className="text-primary hover:underline">
            {"Open dashboard"}
          </Link>
        </p>

        <div className="mt-16 max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border-[3px] border-[#165C8B] shadow-[0_0_50px_rgba(22,92,139,0.6),0_0_100px_rgba(22,92,139,0.3)]">
            <img
              src="/images/screenshot-202025-12-26-20105118.png"
              alt="Gusto Sales Cloud Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="mt-16 mb-8">
          <p className="text-lg text-muted-foreground mb-8">Integrates with your favorite tools</p>
          <div className="relative overflow-hidden w-full">
            <div className="flex gap-16 animate-infinite-scroll whitespace-nowrap">
              <img src="/images/image.png" alt="Integration tools" className="h-32 inline-block" />
              <img src="/images/image.png" alt="Integration tools" className="h-32 inline-block" />
              <img src="/images/image.png" alt="Integration tools" className="h-32 inline-block" />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-sm font-semibold tracking-wider mb-4" style={{ color: "#11FEFF" }}>
            POWERFUL FEATURES
          </p>
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="text-white">Turn social networks into your </span>
            <span style={{ color: "#227274" }}>lead generation engine</span>
          </h2>
        </div>

        <div className="mt-32 max-w-4xl mx-auto">
          <h3 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">Stop scrolling. Start </span>
            <span style={{ color: "#227274" }}>selling.</span>
          </h3>
          <p className="text-lg text-muted-foreground">
            While you waste hours manually searching Reddit for prospects, RedLead works 24/7 to discover and organize
            high-intent leads who are actively asking for solutions like yours.
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  )
}


import React, { useEffect, useRef } from 'react'

interface QuantumParticleProps {
  className?: string
  count?: number
}

export function QuantumParticle({ className = '', count = 15 }: QuantumParticleProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles: HTMLDivElement[] = []

    // Create enhanced particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute rounded-full particle-float pointer-events-none'
      
      // Vary particle properties
      const size = Math.random() * 3 + 1
      const hue = 250 + Math.random() * 60 // Blue to purple range
      const opacity = Math.random() * 0.5 + 0.2
      
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.background = `oklch(0.7 0.15 ${hue} / ${opacity})`
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * 3}s`
      particle.style.animationDuration = `${3 + Math.random() * 4}s`
      
      // Add glow effect to some particles
      if (Math.random() > 0.7) {
        particle.style.boxShadow = `0 0 ${size * 3}px oklch(0.7 0.15 ${hue} / 0.6)`
      }
      
      container.appendChild(particle)
      particles.push(particle)
    }

    // Cleanup
    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      })
    }
  }, [count])

  return (
    <div ref={containerRef} className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} />
  )
}

interface QuantumFieldProps {
  children: React.ReactNode
  className?: string
  particles?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export function QuantumField({ 
  children, 
  className = '', 
  particles = true, 
  intensity = 'medium' 
}: QuantumFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const field = fieldRef.current
    if (!field || !particles) return

    // Create quantum energy waves
    const createEnergyWave = () => {
      const wave = document.createElement('div')
      wave.className = 'absolute rounded-full pointer-events-none'
      
      const size = Math.random() * 200 + 100
      const x = Math.random() * 100
      const y = Math.random() * 100
      const hue = 250 + Math.random() * 60
      
      wave.style.width = '1px'
      wave.style.height = '1px'
      wave.style.left = `${x}%`
      wave.style.top = `${y}%`
      wave.style.background = `oklch(0.7 0.15 ${hue} / 0.1)`
      wave.style.transform = 'translate(-50%, -50%)'
      wave.style.transition = 'all 2s ease-out'
      
      field.appendChild(wave)
      
      // Animate expansion
      requestAnimationFrame(() => {
        wave.style.width = `${size}px`
        wave.style.height = `${size}px`
        wave.style.background = `oklch(0.7 0.15 ${hue} / 0)`
      })
      
      // Remove after animation
      setTimeout(() => {
        if (wave.parentNode) {
          wave.parentNode.removeChild(wave)
        }
      }, 2000)
    }

    // Create waves at intervals based on intensity
    const intervals = { low: 3000, medium: 2000, high: 1000 }
    const interval = setInterval(createEnergyWave, intervals[intensity])

    return () => {
      clearInterval(interval)
    }
  }, [particles, intensity])

  const particleCount = { low: 10, medium: 15, high: 25 }

  return (
    <div ref={fieldRef} className={`quantum-field relative ${className}`}>
      {particles && <QuantumParticle count={particleCount[intensity]} />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
import React from 'react'

interface QuantumParticleProps {
  className?: string
  count?: number
}

export function QuantumParticle({ className = '', count = 5 }: QuantumParticleProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-accent/30 rounded-full particle-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  )
}

interface QuantumFieldProps {
  children: React.ReactNode
  className?: string
  particles?: boolean
}

export function QuantumField({ children, className = '', particles = true }: QuantumFieldProps) {
  return (
    <div className={`quantum-field ${className}`}>
      {particles && <QuantumParticle />}
      {children}
    </div>
  )
}
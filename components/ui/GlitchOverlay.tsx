'use client'

import React, { useState, useEffect } from 'react'

interface GlitchOverlayProps {
  className?: string
  intensity?: 'low' | 'medium' | 'high'
}

export function GlitchOverlay({ 
  className = '', 
  intensity = 'low' 
}: GlitchOverlayProps) {
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }

    // Random glitch timing based on intensity
    const intervals = {
      low: 15000 + Math.random() * 10000,    // 15-25 seconds
      medium: 8000 + Math.random() * 7000,   // 8-15 seconds  
      high: 3000 + Math.random() * 4000      // 3-7 seconds
    }

    const interval = setInterval(triggerGlitch, intervals[intensity])

    return () => clearInterval(interval)
  }, [intensity])

  const glitchVariants = {
    idle: {
      opacity: 0,
      x: 0,
      y: 0,
      scaleX: 1,
      skewX: 0,
    },
    glitch: {
      opacity: [0, 0.1, 0, 0.05, 0],
      x: [0, -2, 2, -1, 1, 0],
      y: [0, 1, -1, 0.5, -0.5, 0],
      scaleX: [1, 1.01, 0.99, 1.005, 0.995, 1],
      skewX: [0, -0.5, 0.5, -0.2, 0.2, 0],
      transition: {
        duration: 0.2,
        times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      }
    }
  }

  const intensitySettings = {
    low: { opacity: 0.03, blur: '1px' },
    medium: { opacity: 0.05, blur: '2px' },
    high: { opacity: 0.08, blur: '3px' }
  }

  const settings = intensitySettings[intensity]

  return (
    <div className={`
      fixed inset-0 pointer-events-none z-[999]
      transition-opacity duration-75
      ${isGlitching ? 'opacity-100' : 'opacity-0'}
      ${className}
    `}>
      {/* Main glitch overlay */}
      <div 
        className={`
          absolute inset-0 
          bg-gradient-to-r from-transparent via-matrix-500/5 to-transparent
          ${isGlitching ? 'animate-random-glitch' : ''}
        `}
      />
      
      {/* RGB separation effect */}
      {isGlitching && (
        <>
          <div className="absolute inset-0 bg-red-500/2 translate-x-0.5 mix-blend-screen" />
          <div className="absolute inset-0 bg-blue-500/2 -translate-x-0.5 mix-blend-screen" />
        </>
      )}
      
      {/* Scan lines */}
      <div className="absolute inset-0 bg-scan-lines opacity-20" />
    </div>
  )
} 
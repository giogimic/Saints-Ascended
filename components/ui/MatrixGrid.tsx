'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface MatrixGridProps {
  className?: string
  animate?: boolean
}

export function MatrixGrid({ className = '', animate = true }: MatrixGridProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const gridContent = (
    <>
      {/* Main Grid Pattern */}
      <div 
        className="absolute inset-0 bg-matrix-grid"
        style={{
          backgroundSize: '40px 40px',
          animation: animate ? 'gridPulse 4s ease-in-out infinite alternate' : 'none'
        }}
      />
      
      {/* Radial Overlays for Depth */}
      <div className="absolute inset-0 bg-gradient-radial from-matrix-900/20 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-transparent via-matrix-500/5 to-transparent" />
      
      {/* Moving Scan Lines */}
      {animate && isClient && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-matrix-scan"
            animate={{
              y: ['0vh', '100vh'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 0
            }}
          />
          <motion.div
            className="absolute top-0 left-0 w-full h-0.5 bg-matrix-scan opacity-60"
            animate={{
              y: ['0vh', '100vh'],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              delay: 1.5
            }}
          />
        </>
      )}
      
      {/* Subtle Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' fill='%2300ff41'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px'
        }}
      />
    </>
  )

  return isClient ? (
    <motion.div
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: animate ? 1 : 0.5 }}
      transition={{ duration: 2 }}
    >
      {gridContent}
    </motion.div>
  ) : (
    <div className={`fixed inset-0 pointer-events-none z-0 opacity-100 ${className}`}>
      {gridContent}
    </div>
  )
} 
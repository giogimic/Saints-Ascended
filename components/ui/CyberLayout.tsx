'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { MatrixGrid } from './MatrixGrid'
import { GlitchOverlay } from './GlitchOverlay'

interface CyberLayoutProps {
  children: ReactNode
  className?: string
  showGlitch?: boolean
  showGrid?: boolean
}

export function CyberLayout({ 
  children, 
  className = '',
  showGlitch = true,
  showGrid = true
}: CyberLayoutProps) {
  return (
    <div className={`relative min-h-screen bg-cyber-bg text-matrix-500 font-mono ${className}`}>
      {/* Background Grid */}
      {showGrid && <MatrixGrid />}
      
      {/* Main Content */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
      
      {/* Glitch Overlay - Last for top layer */}
      {showGlitch && <GlitchOverlay intensity="low" />}
      
      {/* Scan Line Border Effect */}
      <motion.div
        className="fixed top-0 left-0 w-full h-0.5 bg-matrix-scan z-30 pointer-events-none"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 2
        }}
      />
      
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {/* Corner Glows */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-matrix-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-matrix-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-matrix-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-matrix-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  )
} 
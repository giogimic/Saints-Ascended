'use client'

import React, { useState, useEffect, useRef } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { clearAllCaches, forceReloadResource, getCacheBustParam } from '@/lib/cache-bust'

// shadcn/ui imports
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ConsoleMessage {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
}

interface TerminalWindowProps {
  isOpen: boolean
  onClose: () => void
  messages: ConsoleMessage[]
}

export function TerminalWindow({ isOpen, onClose, messages = [] }: TerminalWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [showDevControls, setShowDevControls] = useState(false)
  const [mounted, setMounted] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setShowDevControls(process.env.NODE_ENV === 'development')
  }, [])

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (terminalRef.current && !isMinimized) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [messages, isMinimized])

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-400" />
      default:
        return <InformationCircleIcon className="w-4 h-4 text-matrix-500" />
    }
  }

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-orange-400'
      case 'success':
        return 'text-green-400'
      default:
        return 'text-matrix-500'
    }
  }

  const handleClearCaches = async () => {
    try {
      await clearAllCaches()
      // Add a console message
      const newMessage: ConsoleMessage = {
        message: '🗑️ All caches cleared successfully',
        type: 'success',
        timestamp: mounted ? new Date().toLocaleTimeString() : '00:00:00'
      }
      // You would need to pass this to the parent component to add to messages
      console.log('Caches cleared')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }

  const handleReloadCSS = () => {
    forceReloadResource('css')
    console.log('CSS reloaded')
  }

  const handleForceReload = () => {
    window.location.reload()
  }

  if (!isOpen) return null

  return (
    <Card 
      variant="cyber" 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-12' : showDevControls ? 'w-96 h-96' : 'w-96 h-80'
      }`}
    >
      {/* Header */}
      <CardHeader className="p-3 border-b border-matrix-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-mono font-bold text-matrix-500 uppercase tracking-wider">
              System Console
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {mounted && process.env.NODE_ENV === 'development' && (
              <Button
                variant="cyber-ghost"
                size="xs"
                onClick={() => setShowDevControls(!showDevControls)}
                title="Toggle Dev Controls"
              >
                <span className="text-xs font-mono">
                  {showDevControls ? '🔧' : '⚙️'}
                </span>
              </Button>
            )}
            
            <Button
              variant="cyber-ghost"
              size="xs"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              <span className="text-xs font-mono">
                {isMinimized ? '□' : '_'}
              </span>
            </Button>
            
            <Button
              variant="cyber-ghost"
              size="xs"
              onClick={onClose}
              title="Close Console"
              className="hover:text-red-400"
            >
              <XMarkIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Terminal Content */}
      {!isMinimized && (
        <CardContent className="p-0">
          <ScrollArea 
            className={`${showDevControls ? 'h-48' : 'h-64'} bg-gray-900/50`}
            ref={terminalRef}
          >
            <div className="p-3 space-y-1">
              {messages.map((message, index) => (
                <div 
                  key={`${message.timestamp}-${index}`}
                  className="flex items-start gap-2 py-1 hover:bg-matrix-900/20 transition-colors"
                >
                  <span className="text-matrix-700 text-xs shrink-0 font-mono">
                    {mounted ? message.timestamp : '00:00:00'}
                  </span>
                  
                  <div className="shrink-0 mt-0.5">
                    {getMessageIcon(message.type)}
                  </div>
                  
                  <span className={`${getMessageColor(message.type)} leading-tight text-xs font-mono`}>
                    {message.message}
                  </span>
                </div>
              ))}
            </div>
            
            {messages.length === 0 && (
              <div className="text-matrix-700 text-center py-8 text-sm font-mono">
                No console messages
              </div>
            )}
          </ScrollArea>

          {/* Dev Cache Controls */}
          {mounted && showDevControls && process.env.NODE_ENV === 'development' && (
            <div className="border-t border-matrix-500 p-3 bg-cyber-panel/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-matrix-500 uppercase tracking-wider">
                  🔧 Dev Cache Controls
                </span>
                <span className="text-xs text-matrix-700 font-mono">
                  v{mounted ? getCacheBustParam().replace('?v=', '') : '000000'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleReloadCSS}
                  variant="cyber-info"
                  size="xs"
                  className="text-xs"
                >
                  🎨 Reload CSS
                </Button>
                
                <Button
                  onClick={handleClearCaches}
                  variant="cyber-warning"
                  size="xs"
                  className="text-xs"
                >
                  🗑️ Clear Cache
                </Button>
                
                <Button
                  onClick={handleForceReload}
                  variant="cyber-success"
                  size="xs"
                  className="col-span-2 text-xs"
                >
                  🔄 Force Reload (Ctrl+Shift+F5)
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-matrix-700 text-center font-mono">
                Keyboard: Ctrl+Shift+F5 for hard refresh
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
} 
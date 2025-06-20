'use client'

import React, { useState, useEffect, useRef } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
  const terminalRef = useRef<HTMLDivElement>(null)

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

  if (!isOpen) return null

  return (
    <div className={`fixed bottom-4 right-4 z-50 bg-cyber-panel/95 backdrop-blur-lg border-2 border-matrix-500 shadow-matrix transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-96 h-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-matrix-500 bg-cyber-panel/80">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-matrix-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono font-bold text-matrix-500 uppercase tracking-wider">
            SYSTEM CONSOLE
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-6 h-6 bg-cyber-panel border border-matrix-700 flex items-center justify-center cyber-hover transition-all duration-200 hover:border-matrix-500"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <span className="text-xs font-mono text-matrix-500">
              {isMinimized ? '□' : '_'}
            </span>
          </button>
          
          <button
            onClick={onClose}
            className="w-6 h-6 bg-cyber-panel border border-matrix-700 flex items-center justify-center cyber-hover transition-all duration-200 hover:border-red-500 hover:text-red-400"
            title="Close Console"
          >
            <XMarkIcon className="w-3 h-3 text-matrix-500 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      {!isMinimized && (
        <div 
          ref={terminalRef}
          className="h-64 overflow-y-auto p-3 bg-gray-900/50 font-mono text-xs"
        >
          <div className="space-y-1">
            {messages.map((message, index) => (
              <div 
                key={`${message.timestamp}-${index}`}
                className="flex items-start gap-2 py-1 hover:bg-matrix-900/20 transition-colors"
              >
                <span className="text-matrix-700 text-xs shrink-0">
                  {message.timestamp}
                </span>
                
                <div className="shrink-0 mt-0.5">
                  {getMessageIcon(message.type)}
                </div>
                
                <span className={`${getMessageColor(message.type)} leading-tight`}>
                  {message.message}
                </span>
              </div>
            ))}
          </div>
          
          {messages.length === 0 && (
            <div className="text-matrix-700 text-center py-8">
              No console messages
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
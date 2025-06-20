'use client'

import React, { useState, useEffect, useRef } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface ConsoleMessage {
  id: string
  type: 'info' | 'warning' | 'error' | 'backup' | 'alert' | 'monitor'
  message: string
  timestamp: Date
}

interface TerminalWindowProps {
  isOpen: boolean
  onClose: () => void
  errors?: string[]
}

export function TerminalWindow({ isOpen, onClose, errors = [] }: TerminalWindowProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([])
  const [isMinimized, setIsMinimized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Generate dummy system messages
  useEffect(() => {
    const generateMessage = () => {
      const messageTypes: ConsoleMessage['type'][] = ['backup', 'alert', 'monitor', 'info']
      const dummyMessages = [
        'BACKUP: Server config backed up successfully',
        'ALERT: High memory usage detected on ARK-Server-01',
        'MONITOR: Player count: 24/70 active connections',
        'BACKUP: Mod cache synchronized',
        'ALERT: Steam Workshop update available',
        'MONITOR: CPU temperature: 67°C - Normal range',
        'BACKUP: World save completed - 2.3GB',
        'ALERT: Disk space warning: 15% remaining',
        'MONITOR: Network latency: 45ms average',
        'BACKUP: Player data backup initiated'
      ]

      const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)]
      const randomMessage = dummyMessages[Math.floor(Math.random() * dummyMessages.length)]

      const newMessage: ConsoleMessage = {
        id: Date.now().toString(),
        type: randomType,
        message: randomMessage,
        timestamp: new Date()
      }

      setMessages(prev => [newMessage, ...prev].slice(0, 50)) // Keep last 50 messages
    }

    if (isOpen) {
      // Add initial messages
      const initialMessages: ConsoleMessage[] = [
        {
          id: '1',
          type: 'info',
          message: 'SAINTS ASCENDED CONSOLE INITIALIZED',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'backup',
          message: 'BACKUP: System state saved',
          timestamp: new Date()
        },
        {
          id: '3',
          type: 'monitor',
          message: 'MONITOR: All systems operational',
          timestamp: new Date()
        }
      ]
      setMessages(initialMessages)

      // Generate periodic messages
      const interval = setInterval(generateMessage, 3000 + Math.random() * 5000) // Random interval 3-8 seconds
      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Add external errors to console
  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages: ConsoleMessage[] = errors.map((error, index) => ({
        id: `error-${Date.now()}-${index}`,
        type: 'error',
        message: `ERROR: ${error}`,
        timestamp: new Date()
      }))

      setMessages(prev => [...errorMessages, ...prev].slice(0, 50))
    }
  }, [errors])

  // Auto-scroll to top for new messages
  useEffect(() => {
    if (terminalRef.current && !isMinimized) {
      terminalRef.current.scrollTop = 0
    }
  }, [messages, isMinimized])

  const getMessageIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
      case 'warning':
      case 'alert':
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
      default:
        return <InformationCircleIcon className="w-4 h-4 text-matrix-500" />
    }
  }

  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400'
      case 'warning':
      case 'alert':
        return 'text-orange-400'
      case 'backup':
        return 'text-blue-400'
      case 'monitor':
        return 'text-purple-400'
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
            {messages.map((message) => (
              <div 
                key={message.id}
                className="flex items-start gap-2 py-1 hover:bg-matrix-900/20 transition-colors"
              >
                <span className="text-matrix-700 text-xs shrink-0">
                  {message.timestamp.toLocaleTimeString()}
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
      
      {/* Status Bar when minimized */}
      {isMinimized && (
        <div className="px-3 py-2 text-xs font-mono text-matrix-600">
          {messages.length > 0 && (
            <span className={getMessageColor(messages[0].type)}>
              Latest: {messages[0].message.slice(0, 30)}...
            </span>
          )}
        </div>
      )}
    </div>
  )
} 
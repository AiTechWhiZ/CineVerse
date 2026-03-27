'use client'

import React from 'react'

interface GridBackgroundProps {
  className?: string
  children?: React.ReactNode
}

export function GridBackground({ className = '', children }: GridBackgroundProps) {
  return (
    <div className={`relative min-h-screen grid-background ${className}`}>
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 dark:to-black/30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export default GridBackground

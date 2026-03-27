'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const Loader = ({ size = 'md', text, className }: LoaderProps) => {
  const { currentTheme } = useTheme()
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className={`${sizeClasses[size]} bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
      </motion.div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 text-sm"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export default Loader

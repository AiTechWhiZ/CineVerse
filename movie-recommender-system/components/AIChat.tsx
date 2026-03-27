'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { currentTheme } = useTheme()

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  const handleSendMessage = () => {
    // For now, just clear the message
    // In the future, this would send to an AI service
    setMessage('')
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full flex items-center justify-center shadow-lg z-40 transition-colors duration-200`}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Sparkles className={`w-5 h-5 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} bg-clip-text text-transparent`} />
                <h3 className="font-semibold text-white">AI Assistant</h3>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-start space-x-2 mb-4">
                <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <p className="text-white text-sm">
                    👋 Hi! I'm your AI movie assistant. I'm currently under development, but soon I'll be able to help you discover amazing movies tailored to your taste!
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2 mb-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">You</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <p className="text-white text-sm">What can you do?</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <div className={`w-8 h-8 bg-gradient-to-r ${currentTheme.from} ${currentTheme.to} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <p className="text-white text-sm">
                    🚀 <strong>Coming Soon...</strong><br />
                    • Personalized movie recommendations<br />
                    • Movie trivia and facts<br />
                    • Watch suggestions based on your mood<br />
                    • Movie comparisons and discussions
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className={`flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gradient-to-r focus:${currentTheme.from} focus:${currentTheme.to} transition-colors duration-200`}
                  disabled
                />
                <button
                  onClick={handleSendMessage}
                  disabled
                  className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI chat is coming soon! 🎬
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIChat

import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, User } from 'lucide-react'
import { chatService, ChatMessage, ChatRoom } from '../../services/chatService'
import { useAuthStore } from '../../stores/authStore'

export default function ChatBubble() {
  const { user } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user) {
      chatService.getChatRoom(user.id).then(r => {
        setRoom(r)
        chatService.getMessages(r.id).then(setMessages)
      })
      setUnreadCount(0)
    }
  }, [isOpen, user])

  useEffect(() => {
    // Subscribe to simulated response changes
    const unsubscribe = chatService.subscribeToMessages((newMsg) => {
      setMessages(prev => {
        // avoid duplication
        if (prev.some(m => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      if (!isOpen && newMsg.sender_id === 'agent') {
        setUnreadCount(c => c + 1)
      }
    })

    return () => unsubscribe()
  }, [isOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !user) return

    const activeRoomId = room?.id || 'r-1'
    const name = `${user.first_name} ${user.last_name}`.trim() || 'Tú'
    
    const text = inputValue
    setInputValue('')

    await chatService.sendMessage(activeRoomId, user.id, name, text)
  }

  // If user is not logged in, we show a basic onboarding invite
  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-4 rounded-full bg-gradient-to-r from-primary to-[#e000ff] text-white shadow-neon-pink hover:scale-105 transition-all duration-300"
        >
          <MessageSquare className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-background shadow-neon-cyan animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Conversation Console */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] rounded-2xl glassmorphism border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#121422]/90 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
              <div>
                <h4 className="text-sm font-bold text-geek-light">Soporte AniGames</h4>
                <p className="text-[10px] text-geek-muted">Tiempo de respuesta: ~1 min</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/5 rounded-lg text-geek-muted hover:text-geek-light transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {user ? (
              messages.map((m) => {
                const isMe = m.sender_id === user.id
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[9px] text-geek-muted mb-0.5 px-1">{m.sender_name}</span>
                    <div
                      className={`max-w-[80%] px-3.5 py-2 text-sm rounded-2xl ${
                        isMe
                          ? 'bg-primary text-white rounded-tr-none shadow-neon-pink'
                          : 'bg-[#1b1c2b] text-geek-light rounded-tl-none border border-white/5'
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-4 px-2">
                <div className="p-3 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  <User className="w-8 h-8" />
                </div>
                <h5 className="text-sm font-bold text-geek-light">Inicia sesión para chatear</h5>
                <p className="text-xs text-geek-muted">
                  Necesitas estar conectado para recibir asesoría personalizada en vivo de nuestros operadores.
                </p>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input Panel */}
          {user && (
            <form onSubmit={handleSend} className="p-3.5 bg-[#121422]/90 border-t border-white/5 flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3.5 py-2 bg-[#1b1c2b] text-sm text-geek-light border border-white/5 rounded-xl focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-secondary text-background hover:bg-secondary/95 hover:scale-105 font-bold transition shadow-neon-cyan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      )}

    </div>
  )
}

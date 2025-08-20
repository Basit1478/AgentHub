import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { VoiceChat } from "./VoiceChat"
import { ConversationLimitModal } from "./ConversationLimitModal"
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Volume2,
  MoreVertical,
  Phone,
  Video,
  Search,
  Paperclip,
  Smile,
  Check,
  CheckCheck
} from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

interface Agent {
  id: string
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
  specialties: string[]
  systemPrompt: string
}

interface WhatsAppChatInterfaceProps {
  agent: Agent
  onClose: () => void
}

export function WhatsAppChatInterface({ agent, onClose }: WhatsAppChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showVoiceChat, setShowVoiceChat] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [conversationData, setConversationData] = useState({ conversationsUsed: 0, plan: 'free' })
  const [messageCount, setMessageCount] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hey! 👋 I'm ${agent.name}. I'm here to help you with ${agent.specialties.join(", ").toLowerCase()}. What's on your mind?`,
      timestamp: new Date(),
      status: 'delivered'
    }
    setMessages([welcomeMessage])
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [agent])

  const speakText = (text: string, voice?: string, language?: string) => {
    // Voice implementation handled by VoiceChat component
  }

  const handleVoiceInput = (text: string) => {
    setMessage(text)
    toast({
      title: "Voice Input Received",
      description: "Your message has been transcribed!",
    })
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with agents",
        variant: "destructive"
      })
      // Navigate to auth page
      window.location.href = '/auth'
      return
    }

    // Increment message count and check for upgrade popup
    const newMessageCount = messageCount + 1
    setMessageCount(newMessageCount)
    
    // Show upgrade popup only after exactly 100 messages for free users
    if (newMessageCount === 100 && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('user_id', user.id)
          .single()
        
        if (profile?.plan === 'free') {
          setShowUpgradeModal(true)
        }
      } catch (error) {
        console.error('Error checking user plan:', error)
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ))
    }, 500)

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ))
    }, 1000)

    try {
      const conversationHistory = messages.filter(m => m.id !== "welcome").map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const { data, error } = await supabase.functions.invoke('chat-with-gemini', {
        body: {
          messages: [...conversationHistory, { role: 'user', content: userMessage.content }],
          agentId: agent.id
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to send message')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        status: 'delivered'
      }

      setMessages(prev => [...prev.slice(0, -1), { ...userMessage, status: 'read' }, assistantMessage])
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-3 w-3" />
      case 'delivered':
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return <Loader2 className="h-3 w-3 animate-spin" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="w-full max-w-md h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* WhatsApp Style Header */}
        <div className={`bg-gradient-to-r ${agent.color} p-4 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <agent.icon className="h-6 w-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <p className="text-white/80 text-xs">online</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowVoiceChat(!showVoiceChat)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <Video className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 p-2"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Voice Chat Panel */}
        <AnimatePresence>
          {showVoiceChat && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-border bg-muted/30 p-4"
            >
              <VoiceChat
                onVoiceInput={handleVoiceInput}
                onSpeakText={speakText}
                isListening={isListening}
                isSpeaking={isSpeaking}
                setIsListening={setIsListening}
                setIsSpeaking={setIsSpeaking}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-muted/10 p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 300,
                  delay: index * 0.05 
                }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <motion.div
                    className={`rounded-2xl p-3 shadow-sm relative ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-background border border-border rounded-bl-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs opacity-60 ${
                      msg.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.role === 'user' && getStatusIcon(msg.status)}
                    </div>
                    
                    {/* Triangle pointer */}
                    <div className={`absolute bottom-0 w-3 h-3 ${
                      msg.role === 'user' 
                        ? 'right-0 bg-primary transform rotate-45 translate-x-1 translate-y-1' 
                        : 'left-0 bg-background border-l border-b border-border transform rotate-45 -translate-x-1 translate-y-1'
                    }`} />
                  </motion.div>
                  
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mt-1 ml-2">
                      <Button
                        onClick={() => speakText(msg.content)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                        disabled={isSpeaking}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-background border border-border rounded-2xl rounded-bl-md p-3 shadow-sm">
                <div className="flex items-center space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp Style Input */}
        <div className="p-4 bg-background border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                if (!user) {
                  toast({
                    title: "Authentication Required",
                    description: "Please sign in to upload files",
                    variant: "destructive"
                  })
                  return
                }
                setShowFileUpload(!showFileUpload)
              }}
              variant="ghost"
              size="sm"
              className={`text-muted-foreground hover:text-primary p-2 ${showFileUpload ? 'bg-primary/10 text-primary' : ''}`}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="rounded-full border-border bg-muted/50 pr-10"
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className={`rounded-full h-10 w-10 p-0 ${
                message.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-muted'
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Modals */}
      <ConversationLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        conversationsUsed={conversationData.conversationsUsed}
        plan={conversationData.plan}
      />

      {/* Upgrade to Premium Modal */}
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
                <p className="text-muted-foreground text-sm">
                  You've sent 100 messages! Upgrade to Premium for unlimited conversations, priority support, and advanced features.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => {
                    setShowUpgradeModal(false)
                    window.location.href = '/pricing'
                  }}
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                >
                  Upgrade to Premium
                </Button>
                <Button
                  onClick={() => setShowUpgradeModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Continue with Free Plan
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* File Upload Modal */}
      {showFileUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowFileUpload(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <p className="text-muted-foreground text-sm">
                Select a document to share with {agent.name}
              </p>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer">
                <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to select file</p>
              </div>
              
              <Button
                onClick={() => setShowFileUpload(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
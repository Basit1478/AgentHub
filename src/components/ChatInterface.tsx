import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles,
  MessageSquare,
  Zap,
  Copy,
  RefreshCw
} from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
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

interface ChatInterfaceProps {
  agent: Agent
  onClose: () => void
  apiKey: string
}

export function ChatInterface({ agent, onClose, apiKey }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your ${agent.name}. I'm here to help you with ${agent.specialties.join(", ").toLowerCase()}. How can I assist you today?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [agent])

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      
      setIsListening(true)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setMessage(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => {
        setIsListening(false)
        toast({
          title: "Speech Recognition Error",
          description: "Unable to recognize speech. Please try again.",
          variant: "destructive"
        })
      }
      
      recognition.onend = () => setIsListening(false)
      recognition.start()
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast({
      title: "Copied!",
      description: "Message copied to clipboard.",
    })
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading || !apiKey.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      const allMessages = [
        {
          role: 'user',
          parts: [{ text: `${agent.systemPrompt}\n\nConversation history:\n${messages.filter(m => m.id !== "welcome").map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\nUser: ${userMessage.content}` }]
        }
      ]

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: allMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please check your API key and try again.",
        variant: "destructive"
      })
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

  const clearChat = () => {
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your ${agent.name}. I'm here to help you with ${agent.specialties.join(", ").toLowerCase()}. How can I assist you today?`,
      timestamp: new Date()
    }])
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
        className="w-full max-w-4xl h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${agent.color} p-6 text-white relative`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <agent.icon className="h-8 w-8" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">{agent.name}</h2>
                <p className="text-white/80 text-sm">{agent.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={clearChat}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Specialties */}
          <div className="flex flex-wrap gap-2 mt-4">
            {agent.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="bg-white/20 text-white border-white/30">
                {specialty}
              </Badge>
            ))}
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 translate-y-10" />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                    delay: index * 0.1 
                  }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <motion.div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-primary'
                          : `bg-gradient-to-r ${agent.color}`
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <agent.icon className="h-5 w-5 text-white" />
                      )}
                    </motion.div>
                    
                    {/* Message Bubble */}
                    <motion.div
                      className={`rounded-2xl p-4 shadow-sm relative group ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 border border-border'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      
                      {/* Message Actions */}
                      <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 ${
                        msg.role === 'user' ? 'left-0' : 'right-0'
                      } flex items-center space-x-1 bg-background border border-border rounded-lg p-1 shadow-lg`}>
                        <Button
                          onClick={() => copyMessage(msg.content)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {msg.role === 'assistant' && (
                          <Button
                            onClick={() => speakText(msg.content)}
                            disabled={isSpeaking}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            {isSpeaking ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Volume2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <div className={`text-xs opacity-60 mt-2 ${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Loading Message */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <motion.div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r ${agent.color}`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <agent.icon className="h-5 w-5 text-white" />
                  </motion.div>
                  <div className="bg-muted/50 border border-border rounded-2xl p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background/50 backdrop-blur-sm p-6">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={`Ask ${agent.name} anything...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="pr-12 py-3 text-sm rounded-xl border-border/50 bg-background/80 backdrop-blur-sm focus:bg-background transition-all"
              />
              
              {/* Character count */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {message.length}
              </div>
            </div>
            
            {/* Voice Input */}
            <Button
              onClick={startListening}
              disabled={isLoading || isListening}
              variant="outline"
              size="icon"
              className={`rounded-xl transition-all ${isListening ? 'animate-pulse bg-red-500/10 border-red-500 text-red-500' : ''}`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            {/* Send Button */}
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading || !apiKey.trim()}
              className={`rounded-xl px-6 transition-all bg-gradient-to-r ${agent.color} hover:opacity-90`}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Zap className="h-3 w-3 mr-1" />
                Press Enter to send
              </span>
              <span className="flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                {messages.length - 1} messages
              </span>
            </div>
            
            {!apiKey.trim() && (
              <Badge variant="destructive" className="text-xs">
                API Key Required
              </Badge>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
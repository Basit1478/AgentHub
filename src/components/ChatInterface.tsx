import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { FileUpload } from "@/components/FileUpload"
import { ConversationLimitModal } from "./ConversationLimitModal"
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
  RefreshCw,
  Paperclip,
  FileText
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
}

export function ChatInterface({ agent, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [conversationData, setConversationData] = useState({ conversationsUsed: 0, plan: 'free' })
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
      content: `Hello! I'm your ${agent.name}. I'm here to help you with ${agent.specialties.join(", ").toLowerCase()}. How can I assist you today?`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [agent])

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase.functions.invoke('get-chat-history', {
          body: { agentId: agent.id }
        });
        
        if (data?.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };

    loadChatHistory();
  }, [user, agent.id]);

  // Save chat history
  const saveChat = async (messages: Message[]) => {
    if (!user) return;
    
    try {
      await supabase.functions.invoke('save-chat', {
        body: { messages, agentId: agent.id }
      });
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

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

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    toast({
      title: "Files uploaded!",
      description: `${files.length} file(s) ready to share with ${agent.name}`,
    })
  }

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with agents",
        variant: "destructive"
      })
      return
    }

    // Check conversation limit before sending
    try {
      const { data: limitCheck, error: limitError } = await supabase.functions.invoke('check-conversation-limit');
      
      if (limitError) {
        toast({
          title: "Error",
          description: "Failed to check conversation limit",
          variant: "destructive"
        });
        return;
      }

      if (!limitCheck.can_send) {
        setConversationData({
          conversationsUsed: limitCheck.conversations_used,
          plan: limitCheck.plan
        });
        setShowLimitModal(true);
        return;
      }

      setConversationData({
        conversationsUsed: limitCheck.conversations_used,
        plan: limitCheck.plan
      });

    } catch (error) {
      console.error('Error checking conversation limit:', error);
      toast({
        title: "Error",
        description: "Failed to verify conversation limit",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentFiles = uploadedFiles
    setMessage("")
    setUploadedFiles([])
    setIsLoading(true)

    try {
      const conversationHistory = messages.filter(m => m.id !== "welcome").map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))

      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...conversationHistory, { role: 'user', content: userMessage.content }],
          agentId: agent.id,
          files: currentFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))
        }
      })

      if (error) {
        throw new Error(error.message || 'Failed to send message')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      const newMessages = [...messages, userMessage, assistantMessage]
      setMessages(newMessages)
      
      // Save chat history
      await saveChat(newMessages)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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

        {/* File Upload Modal */}
        <AnimatePresence>
          {showFileUpload && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-20 left-6 right-6 bg-background border border-border rounded-2xl shadow-2xl p-6 z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Upload Files</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFileUpload(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <FileUpload
                onFileUpload={handleFileUpload}
                maxFiles={10}
                maxSize={50 * 1024 * 1024} // 50MB
                className="mb-4"
              />
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Ready to send:</h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {file.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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
            
            {/* File Upload Button */}
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
              variant="outline"
              size="icon"
              className={`rounded-xl transition-all ${showFileUpload ? 'bg-primary/10 border-primary text-primary' : ''}`}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
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
              disabled={!message.trim() || isLoading || !user}
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
          
          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Files ready:</span>
              <div className="flex flex-wrap gap-1">
                {uploadedFiles.map((file, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {file.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
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
              <span className="flex items-center">
                <Paperclip className="h-3 w-3 mr-1" />
                Upload files
              </span>
            </div>
            
            <Badge variant="outline" className="text-xs">
              Powered by RaahBot AI
            </Badge>
          </div>
        </div>

        {/* Conversation Limit Modal */}
        <ConversationLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          conversationsUsed={conversationData.conversationsUsed}
          plan={conversationData.plan}
        />
      </motion.div>
    </motion.div>
  )
}
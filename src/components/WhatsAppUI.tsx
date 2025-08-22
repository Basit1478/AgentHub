import React, { useState, useRef, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { FileUpload } from "@/components/FileUpload"
import { ConversationLimitModal } from "./ConversationLimitModal"
import { 
  Send, 
  Loader2, 
  Mic, 
  MicOff, 
  Paperclip, 
  FileText, 
  X,
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

export function WhatsAppUI({ agent, onClose }: ChatInterfaceProps) {
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
    if (!message.trim() || isLoading || !user) return

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="w-full max-w-md h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`bg-primary p-4 text-primary-foreground flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <motion.div
              className="p-2 bg-primary-foreground/20 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <agent.icon className="h-8 w-8" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold">{agent.name}</h2>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/40">
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
                  delay: index * 0.1,
                }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <motion.div
                  className={`rounded-lg p-3 shadow-sm relative group max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div
                    className={`text-xs opacity-60 mt-1 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Message */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start">
              <div className="bg-white rounded-lg p-3 shadow-sm flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Typing...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-muted p-4 flex items-center space-x-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="pr-12 py-3 text-sm rounded-full bg-background border-border focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            onClick={() => setShowFileUpload(!showFileUpload)}
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:bg-muted-foreground/20">
            <Paperclip className="h-5 w-5" />
          </Button>

          <Button
            onClick={startListening}
            disabled={isLoading || isListening}
            variant="ghost"
            size="icon"
            className={`rounded-full text-muted-foreground hover:bg-muted-foreground/20 ${isListening ? "animate-pulse bg-red-500/20" : ""}`}>
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading}
            className="rounded-full bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
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
  );
}
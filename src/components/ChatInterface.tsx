
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {WhatsAppUI} from '../components/WhatsAppUI';
import {ChatGPTUI} from '../components/ChatGPTUI';
import { motion, AnimatePresence } from 'framer-motion';

<<<<<<< HEAD
const ChatInterface = ({ agent }) => {
  const [activeUI, setActiveUI] = useState('whatsapp');
=======
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
>>>>>>> 292ecbeae734842a9e93eab6dc1324a41e2f22d9

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center p-2 bg-background">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={activeUI === 'whatsapp' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveUI('whatsapp')}
            className={`px-4 py-1 rounded-md transition-colors duration-200 ${
              activeUI === 'whatsapp' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground'
            }`}
          >
            WhatsApp
          </Button>
          <Button
            variant={activeUI === 'chatgpt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveUI('chatgpt')}
            className={`px-4 py-1 rounded-md transition-colors duration-200 ${
              activeUI === 'chatgpt' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground'
            }`}
          >
            ChatGPT
          </Button>
        </div>
      </div>
      <div className="flex-grow p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUI}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {activeUI === 'whatsapp' ? (
              <WhatsAppUI agent={agent}
              onClose={():void=>setActiveUI('')} />

            ) : (
              <ChatGPTUI agent={agent}
              onClose={():void=>setActiveUI('')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ChatInterface;
=======
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
>>>>>>> 292ecbeae734842a9e93eab6dc1324a41e2f22d9

import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Users, TrendingUp, Target, MessageSquare, Send, Bot, Sparkles, User, Loader2, Key } from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  const agents = [
    {
      id: "hr",
      name: "HR Agent",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      description: "Expert in human resources, recruitment, and employee management",
      specialties: ["Recruitment", "Employee Relations", "Performance Management", "Policy Development"],
      systemPrompt: "You are an expert HR professional with extensive experience in human resources, recruitment, employee relations, and organizational development. Provide helpful, professional advice on HR matters.",
      tasks: [
        "Screen and evaluate job candidates",
        "Create job descriptions and postings",
        "Manage employee onboarding processes",
        "Handle HR policy questions",
        "Analyze employee satisfaction data"
      ]
    },
    {
      id: "marketing",
      name: "Marketing Agent",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      description: "Specialized in marketing strategies, campaigns, and customer analysis",
      specialties: ["Digital Marketing", "Content Strategy", "Campaign Analysis", "Customer Insights"],
      systemPrompt: "You are a seasoned marketing expert with deep knowledge in digital marketing, content strategy, brand management, and customer analytics. Help users create effective marketing strategies and campaigns.",
      tasks: [
        "Create marketing campaign strategies",
        "Analyze customer behavior and trends",
        "Generate content ideas and copy",
        "Optimize ad performance",
        "Conduct market research"
      ]
    },
    {
      id: "strategy",
      name: "Strategy Agent",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      description: "Focused on business strategy, planning, and data-driven decisions",
      specialties: ["Business Planning", "Market Analysis", "Financial Modeling", "Risk Assessment"],
      systemPrompt: "You are a senior business strategist with expertise in strategic planning, market analysis, competitive intelligence, and business development. Provide insights for data-driven business decisions.",
      tasks: [
        "Develop business strategies and plans",
        "Analyze market opportunities",
        "Create financial projections",
        "Assess business risks",
        "Optimize operational processes"
      ]
    }
  ]

  const handleAgentSelect = (agentId: string) => {
    if (selectedAgent !== agentId) {
      setSelectedAgent(agentId)
      setMessages([])
      
      // Add welcome message
      const agent = agents.find(a => a.id === agentId)!
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hello! I'm your ${agent.name}. I specialize in ${agent.specialties.join(", ").toLowerCase()}. How can I help you today?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !selectedAgent || isLoading) return
    
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to start chatting.",
        variant: "destructive"
      })
      return
    }

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
      const agent = agents.find(a => a.id === selectedAgent)!
      
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: agent.systemPrompt
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: userMessage.content
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please check your API key and try again.",
        variant: "destructive"
      })
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  return (
    <div className="min-h-screen pt-24">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <Bot className="w-4 h-4 mr-2" />
              AI-Powered Specialists
            </div>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Choose Your <span className="gradient-text">AI Agent</span>
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Select from our specialized AI agents, each trained to excel in their domain. 
            Get expert assistance for HR, Marketing, or Strategy tasks.
          </motion.p>
        </motion.div>
      </section>

      {/* Agents Grid */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {agents.map((agent) => (
              <motion.div key={agent.id} variants={itemVariants}>
                <Card 
                  className={`h-full transition-all duration-300 cursor-pointer border-2 hover:shadow-xl ${
                    selectedAgent === agent.id 
                      ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 p-4 bg-gradient-to-r ${agent.color} rounded-2xl w-fit`}>
                      <agent.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{agent.name}</CardTitle>
                    <p className="text-muted-foreground">{agent.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {agent.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3 text-primary">Can Help With</h4>
                      <ul className="space-y-2">
                        {agent.tasks.slice(0, 3).map((task, index) => (
                          <li key={index} className="flex items-start text-sm text-muted-foreground">
                            <Sparkles className="h-3 w-3 mt-1 mr-2 text-primary flex-shrink-0" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      variant={selectedAgent === agent.id ? "default" : "outline"} 
                      className="w-full"
                      onClick={() => handleAgentSelect(agent.id)}
                    >
                      {selectedAgent === agent.id ? "Selected" : "Select Agent"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* API Key Input */}
          {!selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Key className="h-5 w-5 text-primary" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="apiKey">Perplexity API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your Perplexity API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>For production:</strong> We recommend connecting this project to Supabase 
                      and storing your API key securely in Edge Function Secrets.
                    </p>
                    <p>
                      <strong>Get your API key:</strong> Visit{" "}
                      <a 
                        href="https://www.perplexity.ai/settings/api" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Perplexity API Settings
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Chat Interface */}
          {selectedAgent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="border-b border-border">
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const agent = agents.find(a => a.id === selectedAgent)!
                      return (
                        <>
                          <div className={`p-3 bg-gradient-to-r ${agent.color} rounded-xl`}>
                            <agent.icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">Chat with {agent.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Ask me anything about {agent.specialties.join(", ").toLowerCase()}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {/* Chat Messages Area */}
                  <div className="h-96 overflow-y-auto border-b border-border">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center p-6 bg-muted/20">
                        <div className="text-center text-muted-foreground">
                          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium mb-2">Start a conversation</p>
                          <p className="text-sm">Ask your AI agent any question to get started</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex items-start space-x-3 ${
                              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}
                          >
                            <div className={`flex-shrink-0 ${
                              msg.role === 'user' 
                                ? 'p-2 bg-primary rounded-lg' 
                                : `p-2 bg-gradient-to-r ${agents.find(a => a.id === selectedAgent)?.color} rounded-lg`
                            }`}>
                              {msg.role === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className={`max-w-[70%] p-4 rounded-lg shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground ml-auto' 
                                : 'bg-card border'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-xs mt-2 opacity-70 ${
                                msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {msg.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 bg-gradient-to-r ${agents.find(a => a.id === selectedAgent)?.color} rounded-lg`}>
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-card border p-4 rounded-lg shadow-sm">
                              <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4">
                    <div className="flex space-x-3">
                      <Input
                        placeholder={`Message ${agents.find(a => a.id === selectedAgent)?.name}...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage}
                        disabled={!message.trim() || isLoading || !apiKey.trim()}
                        variant="gradient"
                        className="px-6"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-3 text-xs text-muted-foreground">
                      💡 Try asking: "How can you help me with recruitment?" or "What marketing strategies work best?"
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <motion.div
          className="max-w-7xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Why Choose Our <span className="gradient-text">AI Agents</span>
          </motion.h2>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto"
          >
            Each agent is trained on vast amounts of domain-specific data and continuously learns 
            from interactions to provide better assistance.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Domain Expertise",
                description: "Each agent is specialized in their field with deep knowledge and best practices."
              },
              {
                title: "24/7 Availability",
                description: "Get instant responses and assistance anytime, without waiting for human experts."
              },
              {
                title: "Continuous Learning",
                description: "Our agents improve over time, learning from interactions and staying updated."
              }
            ].map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="text-center p-6 h-full">
                  <h3 className="text-xl font-semibold mb-3 gradient-text">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
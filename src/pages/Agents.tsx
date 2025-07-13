import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Users, TrendingUp, Target, MessageSquare, Bot, Sparkles, Zap } from "lucide-react"
import { ChatInterface } from "@/components/ChatInterface"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Agents() {
  const [chatAgent, setChatAgent] = useState<any>(null)
  const [apiKey, setApiKey] = useState("")
  const { toast } = useToast()

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

  const handleAgentSelect = (agent: any) => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key before starting a conversation.",
        variant: "destructive"
      })
      return
    }
    setChatAgent(agent)
  }

  const closeChatInterface = () => {
    setChatAgent(null)
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge variant="outline" className="mb-4">
              <Bot className="w-4 h-4 mr-2" />
              AI-Powered Specialists
            </Badge>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold gradient-text mb-6"
          >
            Choose Your AI Agent
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Select from our specialized AI agents, each trained to excel in their domain. 
            Get expert assistance with voice and text capabilities in multiple languages.
          </motion.p>
        </motion.div>

        {/* API Key Input Section */}
        {!apiKey.trim() && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-2xl mx-auto mb-12"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-primary/20 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Start Your Conversation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mainApiKey">Gemini API Key</Label>
                    <Input
                      id="mainApiKey"
                      type="password"
                      placeholder="Enter your Gemini API key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    🔑 Get your API key from{" "}
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      Google AI Studio
                    </a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Agents Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {agents.map((agent) => (
            <motion.div key={agent.id} variants={itemVariants}>
              <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 group cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <motion.div 
                    className={`mx-auto mb-4 p-4 bg-gradient-to-r ${agent.color} rounded-2xl w-fit`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <agent.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                    {agent.name}
                  </CardTitle>
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
                    onClick={() => handleAgentSelect(agent)}
                    variant="gradient"
                    className="w-full group relative overflow-hidden"
                    disabled={!apiKey.trim()}
                  >
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Zap className="h-4 w-4" />
                      <span>Start Conversation</span>
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-white/20 rounded-lg"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="text-center mb-16"
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
            Experience the future of AI assistance with voice and text capabilities, 
            multilingual support, and specialized domain expertise.
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "🎯 Domain Expertise",
                description: "Each agent is specialized in their field with deep knowledge and best practices from industry experts."
              },
              {
                title: "🗣️ Voice & Text",
                description: "Communicate naturally through voice commands or text input with real-time speech synthesis."
              },
              {
                title: "🌍 Multilingual",
                description: "Support for 15+ languages including English, Spanish, French, German, Chinese, and more."
              }
            ].map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="text-center p-6 h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <h3 className="text-xl font-semibold mb-3 gradient-text">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Chat Interface Modal */}
      <AnimatePresence>
        {chatAgent && (
          <ChatInterface
            agent={chatAgent}
            onClose={closeChatInterface}
            apiKey={apiKey}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
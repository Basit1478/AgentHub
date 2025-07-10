import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, TrendingUp, Target, MessageSquare, Send, Bot, Sparkles } from "lucide-react"

export default function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [message, setMessage] = useState("")

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
      tasks: [
        "Develop business strategies and plans",
        "Analyze market opportunities",
        "Create financial projections",
        "Assess business risks",
        "Optimize operational processes"
      ]
    }
  ]

  const handleSendMessage = () => {
    if (message.trim() && selectedAgent) {
      // Simulate sending message
      console.log(`Message sent to ${selectedAgent}: ${message}`)
      setMessage("")
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
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      {selectedAgent === agent.id ? "Selected" : "Select Agent"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

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
                  <div className="h-96 p-6 overflow-y-auto bg-muted/20">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 bg-gradient-to-r ${agents.find(a => a.id === selectedAgent)?.color} rounded-lg`}>
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-card p-4 rounded-lg shadow-sm max-w-md">
                          <p className="text-sm">
                            Hello! I'm your {agents.find(a => a.id === selectedAgent)?.name}. 
                            How can I help you today? Feel free to ask me about any {' '}
                            {agents.find(a => a.id === selectedAgent)?.specialties.join(", ").toLowerCase()} questions.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mt-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Start a conversation with your AI agent</p>
                    </div>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-6 border-t border-border">
                    <div className="flex space-x-4">
                      <Input
                        placeholder={`Ask ${agents.find(a => a.id === selectedAgent)?.name} a question...`}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        variant="gradient"
                        className="px-6"
                      >
                        <Send className="h-4 w-4" />
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
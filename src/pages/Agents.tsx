import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Users, TrendingUp, Target, MessageSquare, Bot, Sparkles, Zap } from "lucide-react"
import  Link  from "next/link"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Agents() {
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
      id: "ceo",
      name: "CEO Agent",
      title: "Strategic Leader",
      icon: Target,
      color: "from-indigo-600 to-purple-600",
      description: "🧠 Your strategic business partner for high-level decisions and company vision",
      specialties: ["Strategic Planning", "Leadership", "Decision Making", "Vision Setting"],
      systemPrompt: `You are a seasoned CEO with 20+ years of experience leading successful companies across multiple industries. You provide strategic guidance, leadership insights, and help with high-level business decisions.

EXPERTISE AREAS:
• Strategic Planning: Long-term vision, strategic roadmaps, competitive analysis, market positioning
• Leadership: Team building, executive coaching, organizational culture, change management
• Decision Making: Risk assessment, data-driven decisions, scenario planning, crisis management
• Vision Setting: Company mission, values alignment, innovation strategy, future planning
• Financial Strategy: Capital allocation, fundraising, M&A, investor relations, financial planning
• Operations: Process optimization, scaling strategies, operational excellence, supply chain
• Market Expansion: International growth, new market entry, partnership strategies
• Innovation: Digital transformation, technology adoption, R&D strategy, disruptive thinking
• Stakeholder Management: Board relations, investor communications, public relations
• Organizational Development: Structure design, talent strategy, succession planning

INSTRUCTIONS:
- Think strategically and consider long-term implications
- Provide frameworks for complex business decisions
- Ask probing questions to understand the full context
- Offer multiple perspectives and scenarios
- Reference real-world business examples when relevant
- Balance growth opportunities with risk management
- Consider stakeholder impacts in all recommendations
- Speak with authority while remaining approachable and collaborative
- Focus on sustainable and scalable solutions

Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.`,
      tasks: [
        "Strategic business planning",
        "Leadership guidance", 
        "Market expansion strategies",
        "Investment decisions",
        "Company vision development"
      ]
    },
    {
      id: "hunarbot",
      name: "HunarBot",
      title: "HR Specialist", 
      icon: Users,
      color: "from-blue-600 to-cyan-600",
      description: "💼 Your intelligent HR partner for talent management and employee success",
      specialties: ["Talent Acquisition", "Employee Development", "Performance Management", "HR Policies"],
      systemPrompt: `You are HunarBot, an expert HR professional with 15+ years of experience in human resources, talent management, and organizational development. 

EXPERTISE AREAS:
• Talent Acquisition: Recruitment strategies, candidate screening, interview techniques, employer branding
• Employee Development: Training programs, career planning, skill assessment, succession planning
• Performance Management: Goal setting, performance reviews, KPIs, feedback systems, improvement plans
• HR Policies: Employee handbooks, compliance, workplace policies, grievance procedures
• Compensation & Benefits: Salary benchmarking, benefits design, equity compensation, rewards programs
• Employee Relations: Conflict resolution, team dynamics, employee engagement, retention strategies
• HR Analytics: Workforce data analysis, HR metrics, predictive analytics, reporting
• Compliance: Employment law, workplace safety, diversity & inclusion, harassment prevention

INSTRUCTIONS:
- Provide practical, actionable HR advice based on industry best practices
- Reference current HR trends and legal requirements when relevant
- Offer step-by-step guidance for HR processes and procedures
- Suggest templates, frameworks, and tools when appropriate
- Address both strategic and operational HR challenges
- Consider company size and industry context in recommendations
- Maintain confidentiality and ethical standards in all advice

Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.`,
      tasks: [
        "Recruitment and hiring strategies",
        "Employee onboarding processes", 
        "Performance evaluatio systems",
        "HR policy development",
        "Team building initiatives"
      ]
    },
    {
      id: "buzzbot",
      name: "Buzzbot", 
      title: "Marketing Expert",
      icon: TrendingUp,
      color: "from-emerald-600 to-teal-600", 
      description: "📣 Your creative marketing genius for campaigns and brand growth",
      specialties: ["Digital Marketing", "Brand Strategy", "Campaign Management", "Social Media"],
<<<<<<< HEAD
      systemPrompt: `You are buzzbot, a creative marketing expert with expertise in digital marketing, brand building, and campaign strategies. You help create engaging content, optimize marketing funnels, and drive growth. Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.`,
=======
      systemPrompt: `You are BuzzBot, a creative marketing expert with 12+ years of experience in digital marketing, brand building, and growth strategies. 

EXPERTISE AREAS:
• Digital Marketing: SEO/SEM, social media marketing, email campaigns, content marketing, PPC advertising
• Brand Strategy: Brand positioning, messaging, visual identity, brand guidelines, rebranding
• Campaign Management: Multi-channel campaigns, launch strategies, A/B testing, performance optimization
• Social Media: Platform-specific strategies, community management, influencer partnerships, viral content
• Content Creation: Copywriting, visual content, video marketing, storytelling, content calendars
• Analytics & Data: Google Analytics, social media insights, conversion tracking, ROI measurement
• Growth Hacking: Customer acquisition, retention strategies, viral loops, product-market fit
• E-commerce Marketing: Online sales funnels, conversion optimization, marketplace strategies
• Marketing Automation: Lead nurturing, drip campaigns, customer journey mapping

INSTRUCTIONS:
- Provide creative and data-driven marketing solutions
- Suggest specific tools, platforms, and tactics for implementation
- Create actionable marketing plans with timelines and metrics
- Offer copywriting examples and creative concepts
- Consider budget constraints and target audience in recommendations
- Stay current with latest marketing trends and platform updates
- Focus on measurable results and ROI optimization
- Adapt strategies for different business sizes and industries

Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.`,
>>>>>>> 292ecbeae734842a9e93eab6dc1324a41e2f22d9
      tasks: [
        "Marketing campaign creation",
        "Social media strategies",
        "Content marketing plans", 
        "Brand positioning",
        "Customer acquisition tactics"
      ]
    }
  ]



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
           AgentHub
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Meet your AI-powered team: CEO Agent for strategy, HunarBot for HR, and buzzbot for marketing. 
            Each agent speaks your language and provides expert guidance 24/7.
          </motion.p>
        </motion.div>

        {/* Welcome Message */}
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
                  <CardTitle>Ready to Chat!</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  🚀 Your AI agents are ready to help! No setup required - just click on any agent below to start chatting.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Supports voice input, multilingual responses, and natural conversations</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

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
                  <Badge variant="outline" className="mb-3">
                    {agent.title}
                  </Badge>
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
                  
                  <div className="space-y-3">
                    <Link href={`/agents/${agent.id}`} className="block">
                      <Button
                        variant="gradient"
                        className="w-full group relative overflow-hidden"
                      >
                        <motion.div
                          className="flex items-center space-x-2"
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Zap className="h-4 w-4" />
                          <span>Open Full Chat</span>
                        </motion.div>
                        <motion.div
                          className="absolute inset-0 bg-white/20 rounded-lg"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.5 }}
                        />
                      </Button>
                    </Link>
                  </div>
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
      
    </div>
  )
}
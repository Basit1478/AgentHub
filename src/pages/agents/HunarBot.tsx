import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WhatsAppChatInterface } from "@/components/WhatsAppChatInterface"
import { Link } from "react-router-dom"

const HunarBot = () => {
  const [showChat, setShowChat] = useState(false)

  const agent = {
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
  }

  const handleStartChat = () => {
    setShowChat(true)
  }

  if (showChat) {
    return (
      <WhatsAppChatInterface
        agent={agent}
        onClose={() => setShowChat(false)}
      />
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/agents" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 bg-gradient-to-r ${agent.color} rounded-2xl`}>
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">{agent.name}</h1>
              <Badge variant="outline" className="mt-2">
                {agent.title}
              </Badge>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground mb-8">{agent.description}</p>
        </motion.div>

        {/* Specialties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">HR Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {agent.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Ready to Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Ready to Chat!</h3>
            <p className="text-muted-foreground">
              🚀 Start your HR conversation with HunarBot. No setup required - just click below!
            </p>
          </Card>
        </motion.div>

        {/* Start Chat Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Button
            onClick={handleStartChat}
            variant="gradient"
            size="lg"
            className="w-full max-w-md"
          >
            <Zap className="h-5 w-5 mr-2" />
            Start HR Conversation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default HunarBot
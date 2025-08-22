import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WhatsAppChatInterface } from "@/components/WhatsAppChatInterface"
import Link from "next/link"

const ceo = () => {
  const [showChat, setShowChat] = useState(false)

  const agent = {
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
          <Link href="/agents" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Link>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 bg-gradient-to-r ${agent.color} rounded-2xl`}>
              <Target className="h-8 w-8 text-white" />
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
            <h3 className="text-lg font-semibold mb-4">Core Specialties</h3>
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
              🚀 Start your strategic conversation with CEO Agent. No setup required - just click below!
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
            Start Strategic Conversation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default ceo
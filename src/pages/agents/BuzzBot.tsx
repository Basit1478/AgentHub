import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WhatsAppChatInterface } from "@/components/WhatsAppChatInterface"
import Link from "next/link"

const buzzBot = () => {
  const [showChat, setShowChat] = useState(false)

  const agent = {
    id: "buzzbot",
    name: "BuzzBot", 
    title: "Marketing Expert",
    icon: TrendingUp,
    color: "from-emerald-600 to-teal-600", 
    description: "📣 Your creative marketing genius for campaigns and brand growth",
    specialties: ["Digital Marketing", "Brand Strategy", "Campaign Management", "Social Media"],
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
              <TrendingUp className="h-8 w-8 text-white" />
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
            <h3 className="text-lg font-semibold mb-4">Marketing Expertise</h3>
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
              🚀 Start your marketing conversation with BuzzBot. No setup required - just click below!
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
            Start Marketing Conversation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default buzzBot
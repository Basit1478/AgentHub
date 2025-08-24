import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Target, Users, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WhatsAppChatInterface } from "@/components/WhatsAppChatInterface";
import Link from "next/link";
import { useRouter } from "next/router";

const agentData = {
  ceo: {
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
  },
  hunarbot: {
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
  },
  buzzbot: {
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
  },
};

const AgentDetailPage = () => {
  const router = useRouter();
  const { agentId } = router.query;
  const [showChat, setShowChat] = useState(false);

  const agent = agentData[agentId as keyof typeof agentData];

  useEffect(() => {
    if (!agent) {
      // Handle case where agentId is not found (e.g., redirect to 404 or agents list)
      // For now, we'll just log and return null
      console.error(`Agent with ID ${agentId} not found.`);
    }
  }, [agentId, agent]);

  if (!agent) {
    return null; // Or a loading spinner, or a redirect
  }

  const handleStartChat = () => {
    setShowChat(true);
  };

  if (showChat) {
    return (
      <WhatsAppChatInterface
        agent={agent}
        onClose={() => setShowChat(false)}
      />
    );
  }

  const AgentIcon = agent.icon;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/agents" className="text-gray-500 hover:underline">
            &larr; Back to Agents
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 bg-gradient-to-r ${agent.color} rounded-2xl`}>
              <AgentIcon className="h-8 w-8 text-white" />
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
            <h3 className="text-lg font-semibold mb-4">Core Expertise</h3>
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
              🚀 Start your {agent.name} conversation. No setup required - just click below!
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
            Start {agent.name} Conversation
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDetailPage;

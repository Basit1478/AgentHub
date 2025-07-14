import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ChatInterface } from "@/components/ChatInterface"
import { Link } from "react-router-dom"

const CEOAgent = () => {
  const [apiKey, setApiKey] = useState("")
  const [showChat, setShowChat] = useState(false)
  const { toast } = useToast()

  const agent = {
    id: "ceo",
    name: "CEO Agent",
    title: "Strategic Leader",
    icon: Target,
    color: "from-indigo-600 to-purple-600",
    description: "🧠 Your strategic business partner for high-level decisions and company vision",
    specialties: ["Strategic Planning", "Leadership", "Decision Making", "Vision Setting"],
    systemPrompt: `You are a seasoned CEO with 20+ years of experience leading successful companies. You provide strategic guidance, leadership insights, and help with high-level business decisions. You speak with authority but remain approachable. Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.`,
  }

  const handleStartChat = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to start chatting.",
        variant: "destructive"
      })
      return
    }
    setShowChat(true)
  }

  if (showChat) {
    return (
      <ChatInterface
        agent={agent}
        onClose={() => setShowChat(false)}
        apiKey={apiKey}
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

        {/* API Key Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Gemini API Key</Label>
                <Input
                  id="apiKey"
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
            </div>
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
            disabled={!apiKey.trim()}
          >
            <Zap className="h-5 w-5 mr-2" />
            Start Strategic Conversation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default CEOAgent
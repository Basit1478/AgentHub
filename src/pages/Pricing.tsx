import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, Crown } from "lucide-react"

export default function Pricing() {
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

  const plans = [
    {
      name: "Starter",
      price: "$9",
      period: "/month",
      description: "Perfect for individuals and small teams",
      icon: Star,
      color: "from-blue-500 to-cyan-500",
      features: [
        "3 AI Agents",
        "100 conversations/month",
        "Basic voice synthesis",
        "5 languages supported",
        "Email support",
        "Basic analytics"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for growing businesses and teams",
      icon: Zap,
      color: "from-green-500 to-emerald-500",
      features: [
        "10 AI Agents",
        "1,000 conversations/month",
        "Advanced voice synthesis",
        "25+ languages supported",
        "Priority support",
        "Advanced analytics",
        "Custom agent training",
        "API access"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "Advanced features for large organizations",
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: [
        "Unlimited AI Agents",
        "Unlimited conversations",
        "Premium voice synthesis",
        "50+ languages supported",
        "24/7 dedicated support",
        "Enterprise analytics",
        "Custom integrations",
        "White-label solution",
        "Advanced security",
        "SLA guarantee"
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-4">
              Pricing Plans
            </Badge>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold gradient-text mb-6"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Unlock the power of multilingual AI agents with voice capabilities. 
            Scale your conversations across the globe.
          </motion.p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative ${plan.popular ? 'scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-primary shadow-lg' : ''
              }`}>
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} mx-auto mb-4 flex items-center justify-center`}>
                    <plan.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                  
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className={`w-full mt-8 ${
                      plan.popular 
                        ? 'bg-gradient-primary hover:bg-gradient-primary/90' 
                        : ''
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mt-20 text-center"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-left">
              <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold mb-2">Which languages are supported?</h3>
              <p className="text-muted-foreground">We support 50+ languages including English, Spanish, French, German, Chinese, Japanese, and many more.</p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">Yes! All plans come with a 14-day free trial. No credit card required to get started.</p>
            </div>
            
            <div className="text-left">
              <h3 className="font-semibold mb-2">How does voice synthesis work?</h3>
              <p className="text-muted-foreground">Our AI agents use advanced neural voice synthesis to speak naturally in multiple languages and accents.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
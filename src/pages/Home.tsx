import React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Users, TrendingUp, Target, Sparkles, Zap, Shield } from "lucide-react"

export default function Home() {
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
      icon: Users,
      title: "HR Agent",
      description: "Streamline recruitment, employee management, and HR processes with intelligent automation.",
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      title: "Marketing Agent",
      description: "Optimize campaigns, analyze customer behavior, and boost your marketing ROI effortlessly.",
      color: "text-green-500",
    },
    {
      icon: Target,
      title: "Strategy Agent",
      description: "Make data-driven decisions, forecast trends, and develop winning business strategies.",
      color: "text-purple-500",
    },
  ]

  const features = [
    {
      icon: Sparkles,
      title: "Advanced AI Technology",
      description: "Powered by cutting-edge artificial intelligence for superior performance.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant responses and rapid task completion for maximum efficiency.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <motion.div
          className="max-w-7xl mx-auto text-center relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation AI Agents
            </span>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Transform Your Business with{" "}
            <span className="gradient-text">Intelligent AI Agents</span>
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Empower your team with specialized AI agents for HR, Marketing, and Strategy. 
            Automate tasks, make smarter decisions, and accelerate growth.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="xl" asChild className="group">
              <Link to="/agents">
                Explore AI Agents
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </section>

      {/* AI Agents Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Meet Your <span className="gradient-text">AI Team</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three specialized agents designed to revolutionize different aspects of your business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {agents.map((agent, index) => (
              <motion.div key={agent.title} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-4 bg-gradient-primary rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                      <agent.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{agent.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center mb-6">
                      {agent.description}
                    </p>
                    <Button variant="ghost" className="w-full group-hover:bg-primary/10" asChild>
                      <Link to="/agents">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">AI Agents</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with enterprise-grade technology for modern businesses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="text-center"
              >
                <div className="mx-auto mb-6 p-4 bg-card rounded-2xl w-fit shadow-lg">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-5xl font-bold mb-6"
          >
            Ready to Transform Your Business?
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8"
          >
            Join thousands of companies already using AI Agents to streamline operations and boost productivity.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Button variant="gradient" size="xl" asChild className="group">
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
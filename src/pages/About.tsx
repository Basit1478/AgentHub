import React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Linkedin, Twitter, Mail, Award, Users, Target } from "lucide-react"

export default function About() {
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

  const stats = [
    { icon: Users, label: "Happy Clients", value: "100+" },
    { icon: Target, label: "Success Rate", value: "99%" },
    
  ]

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
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            About <span className="gradient-text">AI Agents</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            We're on a mission to democratize artificial intelligence and make advanced AI capabilities 
            accessible to businesses of all sizes. Our platform empowers teams to work smarter, not harder.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-muted/50">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">Our Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To revolutionize how businesses operate by providing intelligent AI agents that 
                    automate complex tasks, enhance decision-making, and drive unprecedented growth. 
                    We believe every organization deserves access to cutting-edge AI technology.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">Our Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    To create a world where AI agents seamlessly integrate into every business workflow, 
                    enabling human creativity and strategic thinking while handling routine operations. 
                    We envision a future where AI empowers, not replaces, human potential.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CEO Section */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Meet Our <span className="gradient-text">Leadership</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Visionary leaders driving innovation in AI technology
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex justify-center">
            <Card className="max-w-md w-full hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-8">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-primary p-1">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                        <span className="text-4xl font-bold gradient-text">BA</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        CEO & Co-Founder
                      </Badge>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">Basit Ali</h3>
                  <p className="text-muted-foreground mb-4">Chief Executive Officer & Co-Founder</p>
                  
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Basit Ali is a visionary entrepreneur and AI expert with over 1.5 years of experience 
                    in artificial intelligence and Full stack development. He founded AI Agents with the goal 
                    of making advanced AI technology accessible to businesses worldwide.
                  </p>
                  
                  <div className="flex justify-center space-x-4">
                    <a
                      href="https://www.linkedin.com/in/basit-ali-baloch-738285253/"
                      className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href="https://x.com/basitali2405"
                      className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href="https://mail.google.com/mail/ba876943@gmail.com"
                      className="p-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
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
              Our <span className="gradient-text">Impact</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Numbers that speak to our commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 pl-[282px] md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <Card className="p-8  hover:shadow-lg transition-shadow">
                  <div className="mx-auto mb-4  p-4 bg-gradient-primary rounded-2xl w-fit">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 gradient-text">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Company Values */}
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
              Our <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Innovation",
                description: "We constantly push the boundaries of what's possible with AI technology."
              },
              {
                title: "Transparency",
                description: "We believe in open communication and honest relationships with our clients."
              },
              {
                title: "Excellence",
                description: "We strive for perfection in every product and service we deliver."
              }
            ].map((value, index) => (
              <motion.div key={value.title} variants={itemVariants}>
                <Card className="h-full text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-4 gradient-text">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
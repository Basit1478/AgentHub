import React from "react"
import { motion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HelpCircle, MessageCircle, ArrowRight } from "lucide-react"

export default function FAQ() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const faqs = [
    {
      category: "General",
      questions: [
        {
          question: "What are AI Agents?",
          answer: "AI Agents are intelligent software programs designed to automate specific business tasks. Our platform offers three specialized agents: HR Agent for human resources, Marketing Agent for marketing campaigns, and Strategy Agent for business planning and analysis."
        },
        {
          question: "How do AI Agents work?",
          answer: "Our AI Agents use advanced machine learning algorithms and natural language processing to understand your requirements, analyze data, and perform tasks automatically. They learn from your preferences and continuously improve their performance."
        },
        {
          question: "Is my data secure?",
          answer: "Absolutely. We use enterprise-grade security measures including end-to-end encryption, secure data centers, and strict access controls. We're compliant with GDPR, SOC 2, and other major security standards."
        },
        {
          question: "Can I integrate AI Agents with my existing tools?",
          answer: "Yes! Our AI Agents integrate with popular business tools including Slack, Microsoft Teams, Google Workspace, Salesforce, HubSpot, and many others through our API and pre-built connectors."
        }
      ]
    },
    {
      category: "Pricing & Plans",
      questions: [
        {
          question: "What's included in the free plan?",
          answer: "The free plan includes limited access to all three AI agents with basic features, up to 100 interactions per month, and email support. It's perfect for small teams to get started."
        },
        {
          question: "Can I change my plan anytime?",
          answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated for upgrades."
        },
        {
          question: "Do you offer discounts for annual billing?",
          answer: "Yes! We offer a 20% discount when you choose annual billing for Premium and Pro plans. This can save you significant costs over monthly billing."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers."
        }
      ]
    },
    {
      category: "Technical",
      questions: [
        {
          question: "What's your uptime guarantee?",
          answer: "We guarantee 99.9% uptime with our enterprise-grade infrastructure. We have redundant systems and 24/7 monitoring to ensure reliable service."
        },
        {
          question: "How do I get started?",
          answer: "Simply sign up for a free account, choose your AI agents, and start configuring them for your specific needs. Our onboarding process guides you through setup in minutes."
        },
        {
          question: "Do you provide training?",
          answer: "Yes! We offer comprehensive documentation, video tutorials, webinars, and personalized onboarding sessions for Premium and Pro customers."
        },
        {
          question: "What kind of support do you offer?",
          answer: "We provide email support for all users, priority chat support for Premium customers, and dedicated success managers for Pro customers. Enterprise customers get 24/7 phone support."
        }
      ]
    }
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
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
              <HelpCircle className="w-4 h-4 mr-2" />
              Frequently Asked Questions
            </div>
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            How can we <span className="gradient-text">help you?</span>
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Find answers to common questions about AI Agents, our pricing, and how to get started. 
            Can't find what you're looking for? We're here to help!
          </motion.p>
        </motion.div>
      </section>

      {/* FAQ Sections */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {faqs.map((category, categoryIndex) => (
            <motion.div key={category.category} variants={itemVariants} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 gradient-text">{category.category}</h2>
              
              <Card>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${categoryIndex}-${index}`}
                        className="border-b border-border last:border-b-0"
                      >
                        <AccordionTrigger className="px-6 py-4 text-left hover:bg-muted/50 transition-colors">
                          <span className="font-medium">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-muted/50">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl mb-4">
                Still have <span className="gradient-text">questions?</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our team is here to help! Reach out to us and we'll get back to you as soon as possible.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gradient" size="lg" asChild className="group">
                  <Link href="/contact">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild>
                  <Link href="/agents">
                    Explore AI Agents
                  </Link>
                </Button>
              </div>
              
              <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm text-muted-foreground">
                  <strong>Quick tip:</strong> You can also reach us directly on WhatsApp at{" "}
                  <a
                    href="https://wa.me/03703168969"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    +92 370 3168969
                  </a>{" "}
                  for immediate assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
import React, { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react"
import { FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      })
    }, 2000)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "Karachi, Sindh, Pakistan",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+92 370 3168969",
      link: "tel:+923703168969",
    },
    {
      icon: Mail,
      title: "Email",
      content: "ba876943@gmail.com",
      link: "mailto:ba876943@gmail.com",
    },
    {
      icon: Clock,
      title: "Business Hours",
      content: "Mon - Fri: 9AM - 6PM PST",
    },
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
            Get in <span className="gradient-text">Touch</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
          >
            Have questions about AI Agents? Want to discuss your specific needs? 
            We'd love to hear from you and help transform your business.
          </motion.p>
        </motion.div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20 px-4">
        <motion.div
          className="max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          required
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          required
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        placeholder="Your Company"
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="Phone number">Phone Number</Label>
                      <Input
                        id="Phone number"
                        placeholder="Your Phone Number"
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="How can we help you?"
                        required
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project or questions..."
                        rows={6}
                        required
                        className="transition-all focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      variant="gradient"
                      size="lg"
                      className="w-full group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl gradient-text">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={info.title} className="flex items-start space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{info.title}</h4>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-muted-foreground">{info.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl gradient-text">Connect with Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex  p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href="https://instagram.com/basit_ali_official_2005"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:scale-105 transition-transform group"
                    >
                      <FaInstagram className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">Instagram</p>
                        <p className="text-sm opacity-90">@basit_ali_official_2005</p>
                      </div>
                    </a>
                    
                    <a
                      href="https://wa.me/03703168969"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-green-500 text-white rounded-lg hover:scale-105 transition-transform group"
                    >
                      <FaWhatsapp className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">WhatsApp</p>
                        <p className="text-sm opacity-90">+92 370 3168969</p>
                      </div>
                    </a>

                    <a
                      href="https://www.linkedin.com/in/basit-ali-baloch-738285253/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-blue-500 text-white rounded-lg hover:scale-105 transition-transform group"
                    >
                      <FaLinkedin className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">LinkedIn</p>
                        <p className="text-sm opacity-90">@basitalibaloch</p>
                      </div>
                    </a>

                    <a
                      href="https://x.com/basitali2405"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-4 bg-black text-white rounded-lg hover:scale-105 transition-transform group"
                    >
                      <FaXTwitter className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">twitter</p>
                        <p className="text-sm opacity-90">@basitali2405</p>
                      </div>
                    </a>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Follow us for the latest updates on AI technology, product releases, 
                      and industry insights. We're always sharing valuable content!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Response */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                      <Clock className="w-4 h-4 mr-2" />
                      Quick Response Guarantee
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We typically respond to all inquiries within 24 hours during business days. 
                      For urgent matters, please call or message us directly on WhatsApp.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
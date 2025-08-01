"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle, School, Shield, Users, Eye, Clock, Zap, Star, Play, Lock, Smartphone, Monitor, GraduationCap, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<string | undefined>(undefined)

  return (
    <div className="min-h-screen bg-white">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 sm:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className=" relative px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Zap className="mr-1 h-3 w-3" />
                AI-Powered Exam Security
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Secure, Scalable Online Exam Management for{" "}
                <span className="text-blue-600">Universities</span>
              </h1>
              <p className="mb-8 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                AI-powered proctoring, flexible pricing, and real-time control — all in one seamless platform. 
                Transform your examination process with enterprise-grade security and monitoring.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/take-exam/1">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                    <Play className="mr-2 h-5 w-5" />
                    Request Demo
                  </Button>
                </Link>
                <Link href="/signUp">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-gray-300 hover:border-blue-600 hover:text-blue-600">
                    Create University Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No Setup Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Pay Per Use</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className=" px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Get started with Exam Portal in three simple steps</p>
            </div>
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Submit University Request",
                    description: "Supervisor submits a university registration request with institutional details and verification documents.",
                    icon: <Building2 className="h-8 w-8 text-blue-600" />
                  },
                  {
                    step: "02", 
                    title: "Verification & Approval",
                    description: "Our team verifies and approves the request within 24-48 hours, ensuring institutional authenticity.",
                    icon: <Shield className="h-8 w-8 text-green-600" />
                  },
                  {
                    step: "03",
                    title: "Access Dashboard",
                    description: "University gains access to manage teachers, students, and exams through a powerful, role-based dashboard.",
                    icon: <Monitor className="h-8 w-8 text-purple-600" />
                  }
                ]
                .map((item, index) => (
                  <div key={index} className="relative">
                    <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          {item.icon}
                        </div>
                        <div className="mb-2 text-sm font-semibold text-blue-600">STEP {item.step}</div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-center">{item.description}</p>
                      </CardContent>
                    </Card>
                    {index < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className=" px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Modern Education</h2>
              <p className="text-xl text-gray-600">Everything you need to conduct secure, efficient online examinations</p>
            </div>
            <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: <Users className="h-8 w-8 text-blue-600" />,
                  title: "Role-Based Dashboards",
                  description: "Customized interfaces for Supervisors, Exam Controllers, Teachers, and Students with appropriate access controls."
                },
                {
                  icon: <Eye className="h-8 w-8 text-red-600" />,
                  title: "AI Cheating Detection",
                  description: "Advanced face detection, phone usage monitoring, and real-time alerts for suspicious behavior during exams."
                },
                {
                  icon: <Zap className="h-8 w-8 text-yellow-600" />,
                  title: "Real-Time Sync",
                  description: "Secure backend with server-side timing, automated cron jobs, and instant synchronization across all devices."
                },
                {
                  icon: <Clock className="h-8 w-8 text-green-600" />,
                  title: "Exam Scheduling",
                  description: "Flexible scheduling system with automated notifications, conflict detection, and timezone management."
                },
                {
                  icon: <Smartphone className="h-8 w-8 text-purple-600" />,
                  title: "Zero Lag Interface",
                  description: "Optimized UI with smooth interactions, instant responses, and seamless user experience across all devices."
                },
                {
                  icon: <Lock className="h-8 w-8 text-indigo-600" />,
                  title: "Secure Authorization",
                  description: "Enterprise-grade security with encrypted exam events, secure authentication, and comprehensive audit trails."
                }
              ].map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className=" px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Flexible Pricing</h2>
              <p className="text-xl text-gray-600">Pay only for what you use. No hidden fees, no long-term contracts.</p>
            </div>
            <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-3">
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">₹10</span>
                    <span className="text-gray-600">/student/exam</span>
                  </div>
                  <CardDescription className="mt-2">Perfect for small institutions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      "Up to 100 students per exam",
                      "Basic AI monitoring",
                      "Standard support",
                      "Basic analytics",
                      "Email notifications"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6" variant="outline">
                    Get Started
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500 shadow-xl relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">₹20</span>
                    <span className="text-gray-600">/student/exam</span>
                  </div>
                  <CardDescription className="mt-2">Ideal for medium universities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      "Up to 1,000 students per exam",
                      "Advanced AI proctoring",
                      "Priority support",
                      "Advanced analytics & reports",
                      "Custom dashboards",
                      "API access"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">₹30</span>
                    <span className="text-gray-600">/student/exam</span>
                  </div>
                  <CardDescription className="mt-2">For large institutions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      "Unlimited students",
                      "Premium AI monitoring",
                      "24/7 dedicated support",
                      "Custom integrations",
                      "White-label options",
                      "SLA guarantee"
                    ]
                    .map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Volume discounts available for high-frequency institutions</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <span>• PAYG model - No upfront costs</span>
                <span>• Tiered pricing for bulk usage</span>
                <span>• Custom enterprise packages</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className=" px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Institutions</h2>
              <p className="text-xl text-gray-600">Join hundreds of universities already using Exam Portal</p>
            </div>
            <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
              {[
                {
                  quote: "Exam Portal transformed our examination process. The AI monitoring is incredibly accurate and the interface is intuitive for both faculty and students.",
                  author: "Dr. Anita Sharma",
                  role: "Dean of Engineering",
                  institution: "Calcutta University"
                },
                {
                  quote: "The real-time monitoring and automated reporting saved us countless hours. Our exam integrity has never been stronger.",
                  author: "Prof. Jayanta Chaudhuri",
                  role: "Teaching Coordinator",
                  institution: "Techno India University"
                },
                {
                  quote: "Seamless integration and excellent support. The pay-per-use model fits perfectly with our budget constraints.",
                  author: "Dr. Arunavo Dhara",
                  role: "IT Director",
                  institution: "Jadavpur University"
                }
              ].map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="inline h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-gray-600 mb-4">&quot;{testimonial.quote}&quot;</blockquote>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.author}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}, {testimonial.institution}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-gray-50">
          <div className=" px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">Everything you need to know about Exam Portal</p>
            </div>
            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible value={openFaq} onValueChange={setOpenFaq}>
                {[
                  {
                    question: "How does the AI proctoring work?",
                    answer: "Our AI system uses computer vision to monitor students during exams, detecting suspicious behaviors like phone usage, multiple faces, or looking away from the screen. All monitoring is done in real-time with instant alerts to invigilators."
                  },
                  {
                    question: "What are the technical requirements?",
                    answer: "Students need a computer with a webcam, stable internet connection, and a modern web browser. No additional software installation is required. The platform works on Windows, Mac, and Linux systems."
                  },
                  {
                    question: "How is pricing calculated?",
                    answer: "We use a simple pay-per-use model: you're charged only when a student takes an exam. Pricing ranges from ₹10-30 per student per exam based on your plan, with volume discounts available for high-frequency usage."
                  },
                  {
                    question: "Is the platform secure?",
                    answer: "Yes, we use enterprise-grade security with end-to-end encryption, secure authentication, comprehensive audit trails, and compliance with educational data protection standards."
                  },
                  {
                    question: "Can we integrate with existing systems?",
                    answer: "We provide APIs and support integration with popular Learning Management Systems (LMS), Student Information Systems (SIS), and other educational platforms."
                  },
                  {
                    question: "What support do you provide?",
                    answer: "We offer 24/7 technical support, comprehensive documentation, training sessions for staff, and dedicated account management for enterprise clients."
                  }
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-semibold">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className=" px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Exams?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join hundreds of institutions already using Exam Portal for secure, efficient online examinations.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-white text-blue-600 text-lg px-8 py-3">
                    Schedule Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className=" px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-xl">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                  <School className="h-5 w-5 text-white" />
                </div>
                <span>Examix</span>
              </div>
              <p className="text-gray-400">
                Secure, scalable online exam management for universities worldwide.
              </p>
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  <Phone className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Exam Portal. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-4 md:mt-0">
              <MapPin className="h-4 w-4" />
              <span>Made in India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

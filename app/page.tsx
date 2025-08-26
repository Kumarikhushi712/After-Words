"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Check, Shield, Star, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useUserSync } from "@/hooks/useUserSync"

function FAQSection() {
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const faqs = [
    {
      question: "What is a check?",
      answer:
        "Basically, we ping you to confirm you're still around. If you don't reply, your notes go to your people",
    },
    {
      question: "Why can&apos;t it be free?",
      answer:
        "Running secure infrastructure costs money. We charge a one-time fee to ensure we can maintain the service long-term without relying on ads or selling your data.",
    },
    {
      question: "How will they receive my notes?",
      answer:
        "Your recipients will receive an email notification with instructions on how to access their notes securely through our platform.",
    },
    {
      question: "Can they see my notes before I&apos;m deceased?",
      answer:
        "No, your notes remain completely private and encrypted until our verification process confirms delivery should occur.",
    },
    {
      question: "What do you mean by check-in?",
      answer:
        "We&apos;ll send you periodic reminders (monthly, quarterly, or annually) asking you to confirm you&apos;re okay. This prevents accidental delivery.",
    },
    {
      question: "What is a check-in period?",
      answer:
        "This is how often we&apos;ll ask you to confirm you&apos;re still active. You can choose from monthly, quarterly, or annual check-ins.",
    },
    {
      question: "What happens if you go out of business but I want my notes delivered?",
      answer:
        "We have contingency plans in place, including data export options and partnerships to ensure your notes can still be delivered even if our service ends.",
    },
  ]

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isExpanded = expandedItems.includes(index)
        return (
          <Card
            key={index}
            className="bg-slate-800 border-slate-700 overflow-hidden cursor-pointer hover:bg-slate-700/50 transition-colors"
            onClick={() => toggleItem(index)}
          >
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="text-left">{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 flex-shrink-0 ml-4 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </CardTitle>
            </CardHeader>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
              style={{
                overflow: "hidden",
              }}
            >
              <CardContent className="pt-0 pb-6">
                <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
              </CardContent>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default function HomePage() {
  const { isSignedIn } = useUser()

  // Sync user data when they're signed in
  useUserSync()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header>
        <nav className="fixed inset-x-0 z-20 w-full border-b border-slate-700/30 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto px-4 sm:px-12 xl:max-w-6xl xl:px-0">
            <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 lg:py-4 mx-0 ">
              {/* Logo */}
              <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max ">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center mx-0">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <b className="text-lg text-white mx-2">After Words</b>
                </Link>

                {/* Mobile hamburger */}
                <button className="relative -mr-6 p-6 lg:hidden" aria-label="hamburger">
                  <div className="m-auto h-0.5 w-5 rounded bg-white transition duration-300"></div>
                  <div className="m-auto mt-2 h-0.5 w-5 rounded bg-white transition duration-300"></div>
                </button>
              </div>

              {/* Navigation */}
              <div className="invisible absolute top-full left-0 z-20 w-full origin-top-right translate-y-1 scale-90 flex-col flex-wrap justify-end gap-6 rounded-3xl border border-slate-700 bg-slate-800 p-8 opacity-0 shadow-2xl transition-all duration-300 lg:visible lg:relative lg:flex lg:w-auto lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none">
                <div className="text-slate-300 lg:pr-4">
                  <ul className="space-y-6 text-base font-medium tracking-wide lg:flex lg:space-y-0 lg:text-sm">
                    <li>
                      <Link href="#how-it-works" className="block transition hover:text-teal-400 md:px-4">
                        <span>How it works</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#pricing" className="block transition hover:text-teal-400 md:px-4">
                        <span>Pricing</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#faq" className="block transition hover:text-teal-400 md:px-4">
                        <span>FAQs</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Sign in button */}
                <div className="mt-12 -ml-1 flex w-full flex-col space-y-2 sm:flex-row md:w-max lg:mt-0  lg:space-y-0">
                  {isSignedIn ? (
                    <Link href="/notes">
                      <Button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md cursor-pointer">
                        Go to Notes
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/sign-in">
                      <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-6 py-2 rounded-md cursor-pointer">
                        Sign in
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#F2BED1]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-[#FDCEDF]/10 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Leave a note for
                <br />
                your <span className="text-[#F2BED1]">loved ones</span>
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Write your passwords, important information, and instructions. Share them with your loved ones when
                you&apos;re gone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isSignedIn ? (
                  <Link href="/notes">
                    <Button
                      size="lg"
                      className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-slate-900 px-8 py-3 cursor-pointer"
                    >
                      Go to Your Notes
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-slate-900 px-8 py-3 cursor-pointer"
                    >
                      Get Started
                    </Button>
                  </Link>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent cursor-pointer"
                >
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-[#F2BED1]/20 to-[#FDCEDF]/20 rounded-2xl p-8 backdrop-blur-sm border border-[#F2BED1]/20">
                  <div className="space-y-4">
                    <div className="bg-[#F2BED1]/30 rounded-lg p-4 transform rotate-2">
                      <div className="h-2 bg-[#F2BED1] rounded mb-2"></div>
                      <div className="h-1 bg-[#F2BED1]/60 rounded mb-1"></div>
                      <div className="h-1 bg-[#F2BED1]/40 rounded"></div>
                    </div>
                    <div className="bg-[#FDCEDF]/30 rounded-lg p-4 transform -rotate-1">
                      <div className="h-2 bg-[#FDCEDF] rounded mb-2"></div>
                      <div className="h-1 bg-[#FDCEDF]/60 rounded mb-1"></div>
                      <div className="h-1 bg-[#FDCEDF]/40 rounded"></div>
                    </div>
                    <div className="bg-[#F8E8EE]/30 rounded-lg p-4 transform rotate-1">
                      <div className="h-2 bg-[#F8E8EE] rounded mb-2"></div>
                      <div className="h-1 bg-[#F8E8EE]/60 rounded mb-1"></div>
                      <div className="h-1 bg-[#F8E8EE]/40 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">
              How <span className="text-[#F2BED1]">it works</span>
            </h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#F2BED1] rounded-full flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0 mt-1">
                  1
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Write a note</h4>
                  <p className="text-slate-300">
                    Create secure notes with passwords and private information you&apos;d like to share with your loved
                    ones.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#F2BED1] rounded-full flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0 mt-1">
                  2
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Add recipients</h4>
                  <p className="text-slate-300">
                    Choose who should receive your notes and when they should be delivered.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#F2BED1] rounded-full flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0 mt-1">
                  3
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Check in</h4>
                  <p className="text-slate-300">
                    We&apos;ll send you regular reminders to check in. If you don&apos;t respond, your notes will be
                    delivered to your recipients.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <p className="text-slate-300 leading-relaxed">
                Your notes stay private and secure until you&apos;re gone. We use bank-level encryption to protect your
                information, and our verification process ensures your notes are only delivered when intended. You
                maintain complete control over your digital legacy, with the ability to edit, schedule, or delete notes
                at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">
              Store whatever is <span className="text-[#F2BED1]">important</span>
            </h3>
            <p className="text-slate-300 text-lg">Your digital legacy can include anything you want to share.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              "Passwords",
              "Bank Details",
              "Insurance",
              "Crypto Keys",
              "Love Letters",
              "Instructions",
              "Memories",
              "Photos",
              "Documents",
              "Contacts",
              "Wishes",
              "Stories",
            ].map((item, index) => (
              <div key={index} className="bg-slate-800 rounded-lg px-4 py-2 text-center border border-slate-700">
                <span className="text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-slate-300">Online</span>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-sm text-slate-300">Last check-in: 2 days ago</p>
                  <p className="text-xs text-slate-400 mt-1">Next reminder: in 5 days</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-4">
                <span className="text-[#F2BED1]">You are in control</span>
                <br />
                until you aren&apos;t
              </h4>
              <p className="text-slate-300 leading-relaxed">
                You stay in control until everything. Your notes stay private until you&apos;re gone. You can change
                your mind, edit your notes, or cancel delivery at any time. We only act when you can&apos;t.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h4 className="text-3xl font-bold mb-4">
                Regular <span className="text-[#F2BED1]">Reminders</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Life is busy, and we get it. That&apos;s why we&apos;ll remind you to check back in regularly. If you go
                too long without checking in, we&apos;ll send your notes to your recipients.
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-sm font-medium text-white mb-2">Reminder Schedule</p>
                <p className="text-xs text-slate-300">
                  &amp;quot;Hi! We just wanted to check in and see how you&amp;apos;re doing. Please log in to confirm
                  you&amp;apos;re okay.&amp;quot;
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Automatic Delivery</p>
                  <p className="text-xs text-slate-400">Verified and secure</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-3xl font-bold mb-4">
                <span className="text-[#F2BED1]">Automatic</span> Delivery
              </h4>
              <p className="text-slate-300 leading-relaxed">
                here is no manual action needed from your loved ones. We&apos;ll automatically send your notes when the
                time comes, so you can rest easy knowing your legacy is secure.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h4 className="text-3xl font-bold mb-4">
                <span className="text-[#F2BED1]">Secure</span> by-default
              </h4>
              <p className="text-slate-300 leading-relaxed">
                We store your sensitive information using industry-standard encryption. It&apos;s the same standard used
                by financial institutions and governments to protect their most sensitive data.
              </p>
            </div>
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#F2BED1]/20 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-[#F2BED1]" />
                </div>
                <div>
                  <p className="font-medium">AES-256 Encryption</p>
                  <p className="text-xs text-slate-400">Bank-level security</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Used and loved by many</h3>
            <p className="text-slate-300">A growing number of users are getting peace of mind.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">
                  &amp;quot;After Words has given me incredible peace of mind. Knowing that my family will have access
                  to important information when I&amp;apos;m gone is priceless. The interface is intuitive and the
                  security features are top-notch.&amp;quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F2BED1] rounded-full flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-sm">SM</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Sarah Mitchell</p>
                    <p className="text-xs text-slate-400">Mother of two</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 mb-4">
                  &amp;quot;As a tech professional, I appreciate the robust security measures. The encryption is solid,
                  and I love that I can schedule different notes for different people. It&amp;apos;s like having a
                  digital will that actually works.&amp;quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F2BED1] rounded-full flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-sm">DK</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">David Kim</p>
                    <p className="text-xs text-slate-400">Software Engineer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold mb-4">Clear Pricing</h3>
          <p className="text-slate-300 mb-12">Simple, transparent pricing for peace of mind.</p>

          <Card className="bg-slate-800 border-slate-700 max-w-md mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-[#F2BED1] mb-2">₹4,999</div>
                <p className="text-slate-300">One-time payment</p>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300">Unlimited notes</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300">Unlimited recipients</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300">Bank-level encryption</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300">Automatic delivery system</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-slate-300">Regular check-in reminders</span>
                </li>
              </ul>
              {isSignedIn ? (
                <Link href="/notes">
                  <Button className="w-full bg-[#F2BED1] hover:bg-[#FDCEDF] text-slate-900 cursor-pointer">
                    Go to Your Notes
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button className="w-full bg-[#F2BED1] hover:bg-[#FDCEDF] text-slate-900 cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-slate-800/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Frequently Asked Questions</h3>
          </div>

          <FAQSection />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-bold mb-4">
            Don&apos;t leave it to <span className="text-[#F2BED1]">tomorrow</span>
          </h3>
          <p className="text-slate-300 text-lg mb-8">Today may not be the day, but someday will be.</p>
          {isSignedIn ? (
            <Link href="/notes">
              <Button size="lg" className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-slate-900 px-12 py-4 cursor-pointer">
                Go to Your Notes
              </Button>
            </Link>
          ) : (
            <Link href="/sign-up">
              <Button size="lg" className="bg-[#F2BED1] hover:bg-[#FDCEDF] text-slate-900 px-12 py-4 cursor-pointer">
                Start a note for the ones you care about
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-[#F2BED1]" />
                <span className="font-semibold text-white">After Words</span>
              </div>
              <p className="text-slate-400 text-sm">Secure digital legacy platform for your most important messages.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400 text-sm">&copy; 2025 After Words by Khushi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

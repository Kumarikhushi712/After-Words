import { SignUp } from "@clerk/nextjs"
import { Heart, ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F2BED1]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FDCEDF]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F2BED1]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Back to home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#F2BED1] hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#F2BED1]/20 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-[#F2BED1]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-slate-300">Start your digital legacy journey with a secure account</p>
        </div>

        {/* Clerk SignUp Component */}
        <div className="flex justify-center">
          <SignUp
            redirectUrl="/notes"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-slate-800/80 backdrop-blur-sm border-slate-700 shadow-xl",
              },
            }}
          />
        </div>

        {/* Security Features */}
        <div className="mt-6 bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-5 w-5 text-[#F2BED1]" />
            <h3 className="font-medium text-white">Your Security Matters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Multi-Factor Authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Zero-Knowledge Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

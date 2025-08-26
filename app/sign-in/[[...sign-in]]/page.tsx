import { SignIn } from "@clerk/nextjs"
import { Heart, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F2BED1]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FDCEDF]/10 rounded-full blur-3xl"></div>
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
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-300">Sign in to access your private notes and legacy messages</p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            redirectUrl="/notes"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "bg-slate-800/80 backdrop-blur-sm border-slate-700 shadow-xl",
              },
            }}
          />
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">Your data is protected with multi-factor authentication</p>
        </div>
      </div>
    </div>
  )
}

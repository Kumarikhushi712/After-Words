"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface DatabaseStatusProps {
  isSendingTest: boolean
  sendTestEmail: () => void
  hasRecipients: boolean
}

export default function DatabaseStatus({
  isSendingTest,
  sendTestEmail,
  hasRecipients,
}: DatabaseStatusProps) {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch("/api/test-db")
        const data = await response.json()
        setIsConnected(data.success)
      } catch (error) {
        console.error("Error checking database status:", error)
        setIsConnected(false)
      }
    }

    checkDbStatus()
  }, [])

  return (
    <Button
      onClick={sendTestEmail}
      disabled={isSendingTest || !hasRecipients || !isConnected}
      variant="outline"
      className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white cursor-pointer bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSendingTest ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Sending...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>Send Test Email</span>
        </div>
      )}
    </Button>
  )
}

"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ArrowLeft, Users, Plus, Trash2, Mail, AlertCircle } from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import DatabaseStatus from "@/components/DatabaseStatus"

interface Recipient {
  name: string
  email: string
  relationship?: string
}

export default function RecipientsPage() {
  const params = useParams()
  const noteId = params.id as string

  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({ name: "", email: "", relationship: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { user } = useUser()

  // Load recipients when component mounts
  useEffect(() => {
    const loadRecipients = async () => {
      if (!noteId || !user) return

      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/notes/${noteId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.note) {
            setRecipients(data.note.recipients || [])
          }
        } else {
          throw new Error("Failed to load note")
        }
      } catch (error) {
        console.error("Error loading recipients:", error)
        setError("Failed to load recipients")
      } finally {
        setIsLoading(false)
      }
    }

    loadRecipients()
  }, [noteId, user])

  const addRecipient = () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      alert("Please enter both name and email")
      return
    }

    if (!newRecipient.email.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    // Check for duplicate emails
    if (recipients.some((r) => r.email.toLowerCase() === newRecipient.email.toLowerCase())) {
      alert("This email address is already added")
      return
    }

    setRecipients([...recipients, { ...newRecipient }])
    setNewRecipient({ name: "", email: "", relationship: "" })
  }

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const saveRecipients = async () => {
    if (!user) {
      alert("Please sign in to save recipients")
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients: recipients,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage("Recipients saved successfully!")
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error(result.error || "Failed to save recipients")
      }
    } catch (error) {
      console.error("Error saving recipients:", error)
      setError(error instanceof Error ? error.message : "Failed to save recipients")
    } finally {
      setIsSaving(false)
    }
  }

  const sendTestEmail = async () => {
    if (!user) {
      alert("Please sign in to send test emails")
      return
    }

    if (recipients.length === 0) {
      alert("Please add at least one recipient before sending a test email")
      return
    }

    setIsSendingTest(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch("/api/send-note-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId,
          recipients,
          noteUrl: `${window.location.origin}/view-note/${noteId}`,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage(`Test email sent successfully to ${result.results.successful.length} recipient(s)!`)
        if (result.results.failed.length > 0) {
          setError(`Failed to send to ${result.results.failed.length} recipient(s)`)
        }
      } else {
        throw new Error(result.error || "Failed to send test email")
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      setError(error instanceof Error ? error.message : "Failed to send test email")
    } finally {
      setIsSendingTest(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading recipients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header>
        <nav className="fixed inset-x-0 z-20 w-full border-b border-slate-700/30 bg-slate-900/80 backdrop-blur">
          <div className="mx-auto px-4 sm:px-12 xl:max-w-6xl xl:px-0">
            <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 lg:py-4 mx-0">
              {/* Logo */}
              <div className="relative z-20 flex w-full justify-between md:px-0 lg:w-max">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center mx-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <b className="text-lg text-white mx-2">My Last Note</b>
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex items-center space-x-8">
                <Link
                  href="/notes"
                  className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Notes</span>
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Tab Navigation */}
      <div className="pt-24 pb-6">
        <div className="container mx-auto px-6 sm:px-12 xl:max-w-6xl xl:px-0">
          <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 max-w-2xl">
            <Link href="/notes" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              All Notes
            </Link>
            <Link href={`/notes/${noteId}`} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
              Overview
            </Link>
            <Link
              href={`/notes/${noteId}/note`}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Note
            </Link>
            <button className="px-4 py-2 bg-teal-500 text-white rounded-md">Recipients</button>
            <Link
              href={`/notes/${noteId}/settings`}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Note Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12 sm:px-12 xl:max-w-6xl xl:px-0">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-400">Error:</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 flex items-center space-x-3">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}

          {/* Add New Recipient */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Recipient</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Full Name"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={newRecipient.email}
                  onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Input
                  placeholder="Relationship (optional)"
                  value={newRecipient.relationship}
                  onChange={(e) => setNewRecipient({ ...newRecipient, relationship: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <Button onClick={addRecipient} className="bg-teal-500 hover:bg-teal-600 text-white cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </CardContent>
          </Card>

          {/* Recipients List */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Recipients ({recipients.length})</span>
                </div>
                {process.env.NODE_ENV === "development" && (
                  <DatabaseStatus
                    isSendingTest={isSendingTest}
                    sendTestEmail={sendTestEmail}
                    hasRecipients={recipients.length > 0}
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recipients.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-300 mb-2">No recipients added yet</p>
                  <p className="text-slate-400 text-sm">
                    Add recipients who should receive this note when the time comes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recipients.map((recipient, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{recipient.name}</p>
                            <p className="text-slate-400 text-sm">{recipient.email}</p>
                            {recipient.relationship && (
                              <p className="text-slate-500 text-xs">{recipient.relationship}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeRecipient(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Section */}
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              These people will receive your note when the delivery conditions are met.
            </p>
            
            <Button
              onClick={saveRecipients}
              disabled={isSaving}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>Save Recipients</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
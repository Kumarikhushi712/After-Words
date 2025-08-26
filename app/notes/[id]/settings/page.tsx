"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, ArrowLeft, RefreshCw, Shield, Trash2, AlertCircle } from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"

export default function NoteSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string

  const [releaseSettings, setReleaseSettings] = useState({
    releaseMode: "automatically", // "automatically" or "never"
    checkInPeriod: "60 days", // "1 minute", "30 days", "60 days", "90 days"
    isActive: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { user } = useUser()

  // Load note settings when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      if (!noteId || !user) return

      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/notes/${noteId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.note) {
            // Map existing settings to new format
            setReleaseSettings({
              releaseMode: data.note.deliveryTrigger === "automatic" ? "automatically" : "never",
              checkInPeriod: "60 days", // Default value
              isActive: data.note.status === "saved",
            })
          }
        } else {
          throw new Error("Failed to load note")
        }
      } catch (error) {
        console.error("Error loading settings:", error)
        setError("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [noteId, user])

  // Calculate release day based on check-in period
  const calculateReleaseDay = (period: string) => {
    const periodMap: { [key: string]: number } = {
      "1 minute": 0, // For testing - immediate
      "30 days": 30,
      "60 days": 60,
      "90 days": 90,
    }
    return periodMap[period] || 60
  }

  // Get formatted release date text
  const getReleaseText = () => {
    const days = calculateReleaseDay(releaseSettings.checkInPeriod)
    if (days === 0) {
      return "The note will be released immediately after your last check-in (for testing)."
    }
    const suffix = days === 1 ? "st" : days === 2 ? "nd" : days === 3 ? "rd" : "th"
    return `The note will be released on the ${days}${suffix} day of your last check-in.`
  }

  const activateNote = async () => {
    if (!user) {
      alert("Please sign in to activate note")
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
          settings: {
            deliveryTrigger: releaseSettings.releaseMode === "automatically" ? "automatic" : "manual",
            checkInPeriod: releaseSettings.checkInPeriod,
            status: "saved", // Activate the note
            priority: "medium", // Default priority
          },
        }),
      })

      const result = await response.json()

      if (result.success) {
        setReleaseSettings({ ...releaseSettings, isActive: true })
        setSuccessMessage("Note activated successfully!")
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error(result.error || "Failed to activate note")
      }
    } catch (error) {
      console.error("Error activating note:", error)
      setError(error instanceof Error ? error.message : "Failed to activate note")
    } finally {
      setIsSaving(false)
    }
  }

  const deleteNote = async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return
    }

    if (!user) {
      alert("Please sign in to delete notes")
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        alert("Note deleted successfully!")
        router.push("/notes")
      } else {
        throw new Error(result.error || "Failed to delete note")
      }
    } catch (error) {
      console.error("Error deleting note:", error)
      setError(error instanceof Error ? error.message : "Failed to delete note")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading settings...</p>
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
            <Link
              href={`/notes/${noteId}/recipients`}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Recipients
            </Link>
            <button className="px-4 py-2 bg-teal-500 text-white rounded-md">Note Settings</button>
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

          {/* Release Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>Release Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Release Mode and Check-in Period */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-white">
                  <Select
                    value={releaseSettings.releaseMode}
                    onValueChange={(value) => setReleaseSettings({ ...releaseSettings, releaseMode: value })}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-auto min-w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="automatically">Automatically</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-white">release my note...</span>
                </div>

                {releaseSettings.releaseMode === "automatically" && (
                  <div className="flex flex-wrap items-center gap-2 text-white ml-4">
                    <span className="text-slate-300">... if I don&apos;t check-in</span>
                    <span className="text-white">for</span>
                    <Select
                      value={releaseSettings.checkInPeriod}
                      onValueChange={(value) => setReleaseSettings({ ...releaseSettings, checkInPeriod: value })}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white w-auto min-w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="1 minute">1 minute</SelectItem>
                        <SelectItem value="30 days">30 days</SelectItem>
                        <SelectItem value="60 days">60 days</SelectItem>
                        <SelectItem value="90 days">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Info Text */}
              {releaseSettings.releaseMode === "automatically" && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">{getReleaseText()}</p>
                </div>
              )}

              {releaseSettings.releaseMode === "never" && (
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-300 text-sm">
                    This note will never be automatically released. You can manually release it at any time.
                  </p>
                </div>
              )}

              {/* Activate Button */}
              <div className="pt-4">
                <Button
                  onClick={activateNote}
                  disabled={isSaving || releaseSettings.isActive}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Activating...</span>
                    </div>
                  ) : releaseSettings.isActive ? (
                    <span>Note Activated</span>
                  ) : (
                    <span>Activate note</span>
                  )}
                </Button>
                {releaseSettings.isActive && (
                  <p className="text-green-400 text-sm mt-2">✓ This note is currently active and ready for release</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security & Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white font-medium">Encryption Enabled</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Your note content is encrypted using AES-256 encryption and stored securely.
                </p>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white font-medium">Access Logging</span>
                </div>
                <p className="text-slate-400 text-sm">All access to this note is logged for security purposes.</p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="bg-red-900/20 border-red-800">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium mb-1">Delete this note</p>
                  <p className="text-slate-400 text-sm">
                    Once deleted, this note and all its data will be permanently removed.
                  </p>
                </div>
                <Button
                  onClick={deleteNote}
                  disabled={isDeleting}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    <span>Delete Note</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

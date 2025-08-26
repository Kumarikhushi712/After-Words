"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, ArrowLeft, Users, Settings, Clock, AlertCircle, Edit3 } from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import { useUserSync } from "@/hooks/useUserSync"

interface Recipient {
  name: string
  email: string
}

interface Attachment {
  name: string;
  type: string;
  size: number;
  data: string; // Assuming data is stored as a base64 string
}

interface Note {
  id: string
  noteId: string
  title: string
  status: string
  recipients: Recipient[]
  createdAt: string
  updatedAt: string
  isDelivered: boolean
  content?: {
    textNote: string
    sensitiveInfo: string
    attachments: Attachment[]
  }
}

export default function NoteOverviewPage() {
  const params = useParams()
  const noteId = params.id as string

  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useUser()
  const { isSyncing, syncError } = useUserSync()

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      if (!user || isSyncing || !noteId) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/notes/${noteId}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.note) {
          setNote(data.note)
        } else {
          setError(data.error || "Failed to fetch note")
        }
      } catch (error) {
        console.error("Error fetching note:", error)
        setError(error instanceof Error ? error.message : "Failed to load note")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [user, isSyncing, noteId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "text-green-400"
      case "draft":
        return "text-yellow-400"
      case "delivered":
        return "text-blue-400"
      default:
        return "text-orange-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "saved":
        return "Active"
      case "draft":
        return "Draft"
      case "delivered":
        return "Delivered"
      default:
        return "Inactive"
    }
  }

  const getStatusMessage = (status: string, recipients: Recipient[]) => {
    if (status === "delivered") {
      return "This note has been delivered"
    }
    if (recipients.length === 0) {
      return "This note will not be sent to anyone"
    }
    if (status === "draft") {
      return "This note is still being edited"
    }
    if (status === "saved") {
      return "This note is ready to be delivered"
    }
    return "This note will not be sent to anyone"
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return "Invalid date"
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading note...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !note) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">Error loading note</p>
          <p className="text-slate-400 text-sm">{error || "Note not found"}</p>
          <Link href="/notes">
            <Button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white cursor-pointer">Back to Notes</Button>
          </Link>
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
            <button className="px-4 py-2 bg-teal-500 text-white rounded-md">Overview</button>
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
        <div className="max-w-4xl mx-auto">
          {/* Sync Status */}
          {isSyncing && (
            <div className="mb-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4 flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-400">Syncing your account...</span>
            </div>
          )}

          {syncError && (
            <div className="mb-6 bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-400">Account sync error:</p>
                <p className="text-red-300 text-sm">{syncError}</p>
              </div>
            </div>
          )}

          {/* Note Overview Cards */}
          <div className="space-y-4">
            {/* Note Info Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white mb-2">{note.title || "Untitled Note"}</h2>
                    <p className="text-slate-400 text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Last updated: {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link href={`/notes/${noteId}/note`}>
                      <Button
                        variant="outline"
                        className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white cursor-pointer bg-transparent"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Note
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipients Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-2">Recipients</h3>
                    <p className="text-slate-400">
                      {note.recipients && note.recipients.length === 0
                        ? "No one will receive this note"
                        : `${note.recipients?.length || 0} recipient${(note.recipients?.length || 0) > 1 ? "s" : ""} assigned`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link href={`/notes/${noteId}/recipients`}>
                      <Button
                        variant="outline"
                        className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white cursor-pointer bg-transparent"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Recipients
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          note.status === "saved"
                            ? "bg-green-500"
                            : note.status === "draft"
                              ? "bg-yellow-500"
                              : note.status === "delivered"
                                ? "bg-blue-500"
                                : "bg-orange-500"
                        }`}
                      ></div>
                      <span className={`font-medium ${getStatusColor(note.status)}`}>{getStatusText(note.status)}</span>
                    </div>
                    <p className="text-slate-400">{getStatusMessage(note.status, note.recipients || [])}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link href={`/notes/${noteId}/settings`}>
                      <Button
                        variant="outline"
                        className="border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white cursor-pointer bg-transparent"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

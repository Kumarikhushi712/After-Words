"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Menu, X, Plus, AlertCircle, ChevronRight, Clock, Users } from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { useUserSync } from "@/hooks/useUserSync"

interface Recipient {
  name: string
  email: string
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
}

export default function NotesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoadingNotes, setIsLoadingNotes] = useState(true)
  const [notesError, setNotesError] = useState<string | null>(null)

  const { user } = useUser()
  const { isSyncing, syncError } = useUserSync()
  const router = useRouter()

  // Fetch notes when component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user || isSyncing) return

      setIsLoadingNotes(true)
      setNotesError(null)

      try {
        const response = await fetch("/api/notes")
        const data = await response.json()

        if (data.success) {
          setNotes(data.notes)
        } else {
          setNotesError(data.error || "Failed to fetch notes")
        }
      } catch (error) {
        console.error("Error fetching notes:", error)
        setNotesError("Failed to load notes")
      } finally {
        setIsLoadingNotes(false)
      }
    }

    fetchNotes()
  }, [user, isSyncing])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNewNote = async () => {
    if (!user) {
      alert("Please sign in to create notes")
      return
    }

    if (isSyncing) {
      alert("Please wait while we sync your account...")
      return
    }

    if (syncError) {
      alert("There was an error syncing your account. Please refresh the page and try again.")
      return
    }

    setIsCreatingNote(true)

    try {
      // Generate UUID for the new note
      const noteId = uuidv4()

      // Create a placeholder note entry in the database
      const response = await fetch("/api/notes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId,
          title: "Untitled Note",
          status: "draft",
        }),
      })

      if (response.ok) {
        // Redirect to the new note editor
        router.push(`/notes/${noteId}/note`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create note")
      }
    } catch (error) {
      console.error("Error creating note:", error)
      alert(`Failed to create new note: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsCreatingNote(false)
    }
  }

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`) // Changed from `/notes/${noteId}/note` to `/notes/${noteId}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "saved":
        return "text-green-400"
      case "draft":
        return "text-yellow-400"
      case "delivered":
        return "text-blue-400"
      default:
        return "text-slate-400"
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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

                {/* Mobile hamburger */}
                <button onClick={toggleMobileMenu} className="relative -mr-6 p-6 lg:hidden" aria-label="hamburger">
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5 text-white" />
                  ) : (
                    <>
                      <div className="m-auto h-0.5 w-5 rounded bg-white transition duration-300"></div>
                      <div className="m-auto mt-2 h-0.5 w-5 rounded bg-white transition duration-300"></div>
                    </>
                  )}
                </button>
              </div>

              {/* Mobile overlay */}
              <div
                className={`fixed inset-0 z-10 h-screen w-screen origin-bottom bg-slate-900/70 backdrop-blur-2xl transition duration-500 lg:hidden ${
                  isMobileMenuOpen ? "scale-y-100" : "scale-y-0"
                }`}
                onClick={toggleMobileMenu}
              />

              {/* Navigation */}
              <div
                className={`absolute top-full left-0 z-20 w-full origin-top-right flex-col flex-wrap justify-end gap-6 rounded-3xl border border-slate-700 bg-slate-800 p-8 shadow-2xl transition-all duration-300 lg:visible lg:relative lg:flex lg:w-auto lg:translate-y-0 lg:scale-100 lg:flex-row lg:items-center lg:gap-0 lg:border-none lg:bg-transparent lg:p-0 lg:opacity-100 lg:shadow-none ${
                  isMobileMenuOpen
                    ? "visible translate-y-1 scale-100 opacity-100"
                    : "invisible translate-y-1 scale-90 opacity-0"
                }`}
              >
                <div className="text-slate-300 lg:pr-4">
                  <ul className="space-y-6 text-base font-medium tracking-wide lg:flex lg:space-y-0 lg:text-sm">
                    <li>
                      <span className="block text-white font-medium md:px-4">Notes</span>
                    </li>
                  </ul>
                </div>

                {/* User Profile */}
                <div className="mt-12 -ml-1 flex w-full flex-col space-y-2 sm:flex-row md:w-max lg:mt-0 lg:mr-6 lg:space-y-0 lg:space-x-4 items-center">
                  {user && (
                    <div className="hidden lg:block text-slate-300 text-sm">
                      Welcome, {user.firstName || user.emailAddresses[0].emailAddress}
                    </div>
                  )}
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: {
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                        },
                        userButtonPopoverActionButton: {
                          color: "#ffffff",
                          "&:hover": {
                            backgroundColor: "#334155",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Add top padding to account for fixed header */}
      <div className="pt-32">
        <div className="container mx-auto px-6 py-12">
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

            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-medium text-white">Your notes</h1>
                {user && (
                  <p className="text-slate-400 text-sm mt-1">
                    Welcome back, {user.firstName || user.emailAddresses[0].emailAddress.split("@")[0]}
                  </p>
                )}
              </div>
              <Button
                onClick={handleNewNote}
                disabled={isCreatingNote || isSyncing}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-md cursor-pointer flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingNote ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>New Note</span>
                  </>
                )}
              </Button>
            </div>

            {/* Notes Error */}
            {notesError && (
              <div className="mb-6 bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-red-400">Error loading notes:</p>
                  <p className="text-red-300 text-sm">{notesError}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoadingNotes ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-300">Loading your notes...</p>
                </CardContent>
              </Card>
            ) : notes.length === 0 ? (
              /* Empty State Card */
              <Card className="bg-slate-800/50 border-slate-700 min-h-[300px]">
                <CardContent className="flex flex-col items-center justify-center py-20">
                  <div className="mb-6">
                    <Menu className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-300 text-lg mb-2">You do not have any notes yet.</p>
                  <p className="text-slate-400 text-sm mb-6">
                    Create your first note to begin building your digital legacy.
                  </p>
                  <Button
                    onClick={handleNewNote}
                    disabled={isCreatingNote || isSyncing}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 cursor-pointer flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingNote ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Create Your First Note</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Notes List */
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-700">
                    {notes.map((note) => (
                      <div
                        key={note.noteId}
                        onClick={() => handleNoteClick(note.noteId)}
                        className="flex items-center justify-between p-6 hover:bg-slate-700/30 cursor-pointer transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium truncate group-hover:text-teal-400 transition-colors">
                                {note.title || "Untitled Note"}
                              </h3>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className={`text-sm ${getStatusColor(note.status)}`}>
                                  {getStatusText(note.status)}
                                </span>
                                <span className="text-slate-400 text-sm flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {note.recipients.length === 0
                                    ? "No recipients"
                                    : `${note.recipients.length} recipients`}
                                </span>
                                <span className="text-slate-400 text-sm flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(note.updatedAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-slate-400 text-sm group-hover:text-teal-400 transition-colors">
                            Open
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-teal-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

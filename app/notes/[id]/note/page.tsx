"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Save, Bold, Italic, Underline, List, Heart, CheckCircle, ArrowLeft } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import FileUploadZone from "@/components/FileUploadZone"
import type { UploadedFile } from "@/lib/cloudinary"

const suggestions = [
  "Important passwords",
  "Insurance policies",
  "Anything owed or lent",
  "Online subscriptions to cancel",
  "Bills or loans to pay to avoid late fees",
  "Any information that your business partners would want to know",
  "Contact information for other important people in your life, such as close friends",
  "Any accounts or assets that you have and the login information for them",
  "Special instructions or wishes",
]

export default function NoteEditorPage() {
  const params = useParams()
  const noteId = params.id as string

  const [title, setTitle] = useState("Untitled Note")
  const [textNote, setTextNote] = useState("")
  const [sensitiveInfo, setSensitiveInfo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const [noteExists, setNoteExists] = useState(false)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const sensitiveAreaRef = useRef<HTMLTextAreaElement>(null)

  const { user } = useUser()
  //const router = useRouter()

  // Load note data if it exists
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId || !user) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/notes/${noteId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.note) {
            setTitle(data.note.title || "Untitled Note") // Use "Untitled Note" as placeholder if empty
            if (data.note.content) {
              const content = typeof data.note.content === "string" ? JSON.parse(data.note.content) : data.note.content
              setTextNote(content.textNote || "")
              setSensitiveInfo(content.sensitiveInfo || "")
              setUploadedFiles(content.attachments || [])
            }
            setNoteExists(true)
          }
        }
      } catch (error) {
        console.error("Error loading note:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [noteId, user])

  const insertTextAtCursor = (textarea: HTMLTextAreaElement, text: string) => {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value
    const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)

    if (textarea === textAreaRef.current) {
      setTextNote(newValue)
    } else if (textarea === sensitiveAreaRef.current) {
      setSensitiveInfo(newValue)
    }

    // Reset cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const formatText = (format: string, textarea: HTMLTextAreaElement) => {
    const selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)

    if (!selectedText) return

    let formattedText = ""
    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "underline":
        formattedText = `__${selectedText}__`
        break
      case "list":
        formattedText = `\n• ${selectedText}`
        break
      default:
        formattedText = selectedText
    }

    insertTextAtCursor(textarea, formattedText)
  }

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save notes")
      return
    }

    const finalTitle = title.trim() || "Untitled Note"

    if (!finalTitle.trim() || (!textNote.trim() && !sensitiveInfo.trim())) {
      alert("Please add some content to your note")
      return
    }

    setIsSaving(true)

    try {
      // Combine content with Cloudinary files
      const content = {
        textNote: textNote || "",
        sensitiveInfo: sensitiveInfo || "",
        attachments: uploadedFiles,
      }

      const response = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId,
          title: finalTitle,
          content,
          status: "saved",
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert("Note saved successfully!")
        setTitle(finalTitle)
        setNoteExists(true)
      } else {
        alert(`Failed to save note: ${result.error}`)
      }
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save note. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

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
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Tab Navigation */}
      <div className="pt-24 pb-6">
        <div className="container mx-auto px-6 sm:px-12 xl:max-w-6xl xl:px-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 max-w-2xl">
              <Link href="/notes" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                All Notes
              </Link>
              <Link href={`/notes/${noteId}`} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
                Overview
              </Link>
              <button className="px-4 py-2 bg-teal-500 text-white rounded-md">Note</button>
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

            {/* Note ID Display */}
            <div className="text-sm text-slate-400">
              Note ID: <span className="font-mono text-teal-400">{noteId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12 sm:px-12 xl:max-w-6xl xl:px-0">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Note Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editable Title */}
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none text-white placeholder:text-slate-400 px-0 focus:ring-0 focus:border-none"
                placeholder="Enter note title..."
              />
            </div>

            {/* Status Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${noteExists ? "bg-green-500" : "bg-yellow-500"}`}></div>
              <span className="text-slate-400">
                {noteExists ? "Note exists in database" : "Draft note (not yet saved)"}
              </span>
            </div>

            {/* Text Note Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Your text note:</h3>

                    {/* Text Formatting Tools */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer bg-transparent"
                        onClick={() => textAreaRef.current && formatText("bold", textAreaRef.current)}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer bg-transparent"
                        onClick={() => textAreaRef.current && formatText("italic", textAreaRef.current)}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer bg-transparent"
                        onClick={() => textAreaRef.current && formatText("underline", textAreaRef.current)}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 cursor-pointer bg-transparent"
                        onClick={() => textAreaRef.current && formatText("list", textAreaRef.current)}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    ref={textAreaRef}
                    value={textNote}
                    onChange={(e) => setTextNote(e.target.value)}
                    placeholder="Your note goes here. Don&apos;t hold back, write as much as you need to."
                    className="min-h-[200px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sensitive Information Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Sensitive information:</h3>
                    <Link href="#" className="text-teal-400 text-sm hover:text-teal-300">
                      How it&apos;s stored
                    </Link>
                  </div>

                  <Textarea
                    ref={sensitiveAreaRef}
                    value={sensitiveInfo}
                    onChange={(e) => setSensitiveInfo(e.target.value)}
                    placeholder="Any sensitive information, such as passwords, secret keys, etc."
                    className="min-h-[150px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Attachments:</h3>
                    <Link href="#" className="text-teal-400 text-sm hover:text-teal-300">
                      Powered by Cloudinary
                    </Link>
                  </div>

                  <FileUploadZone
                    files={uploadedFiles}
                    onFilesChange={setUploadedFiles}
                    maxFiles={10}
                    disabled={isSaving}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Section */}
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">Don&apos;t worry, you can update it any time you want.</p>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-2 cursor-pointer"
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save note</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          {/* Right Column - Suggestions */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700 sticky top-32">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Heart className="h-8 w-8 text-teal-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-white mb-2">what you might want to share</h3>
                </div>

                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-teal-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

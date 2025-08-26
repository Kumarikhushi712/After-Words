import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createNote } from "@/lib/noteService"
import { getUserByClerkId } from "@/lib/userService"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const textNote = formData.get("textNote") as string
    const sensitiveInfo = formData.get("sensitiveInfo") as string

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    if (!textNote?.trim() && !sensitiveInfo?.trim()) {
      return NextResponse.json({ error: "Note content is required" }, { status: 400 })
    }

    // Handle file uploads
    const files: File[] = []
    const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith("file_"))

    for (const [, file] of fileEntries) {
      if (file instanceof File) {
        files.push(file)
      }
    }

    // Process files (in a real app, you'd upload to cloud storage)
    const attachments = await Promise.all(
      files.map(async (file) => {
        // Convert file to base64 for storage (not recommended for production)
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString("base64")

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64, // In production, store URL to cloud storage instead
        }
      }),
    )

    // Combine text note and sensitive info
    const content = {
      textNote: textNote || "",
      sensitiveInfo: sensitiveInfo || "",
      attachments,
    }

    // Create note in database
    const newNote = await createNote({
      userId: new ObjectId(user._id),
      title,
      content: JSON.stringify(content),
      recipients: [], // Will be added later in recipients tab
      deliveryTrigger: "automatic",
      priority: "medium",
    })

    return NextResponse.json({
      success: true,
      note: {
        id: newNote._id,
        title: newNote.title,
        createdAt: newNote.createdAt,
      },
      message: "Note saved successfully",
    })
  } catch (error) {
    console.error("Note creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save note",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's notes from database
    const db = await getDatabase()
    const collection = db.collection("notes")

    const notes = await collection
      .find({ userId: new ObjectId(user._id) })
      .sort({ updatedAt: -1 })
      .toArray()

    // Format notes for frontend
    const formattedNotes = notes.map((note) => ({
      id: note._id,
      noteId: note.noteId,
      title: note.title,
      status: note.status || "draft",
      recipients: note.recipients || [],
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      isDelivered: note.isDelivered || false,
    }))

    return NextResponse.json({
      success: true,
      notes: formattedNotes,
    })
  } catch (error) {
    console.error("Notes fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

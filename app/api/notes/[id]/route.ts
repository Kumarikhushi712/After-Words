import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/userService"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = params.id

    // Get user from database
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find note by noteId (UUID) and userId
    const db = await getDatabase()
    const collection = db.collection("notes")

    const note = await collection.findOne({
      noteId,
      userId: new ObjectId(user._id),
    })

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      note: {
        id: note._id,
        noteId: note.noteId,
        title: note.title,
        content: note.content,
        status: note.status,
        recipients: note.recipients || [],
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      },
    })
  } catch (error) {
    console.error("Note fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch note",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

interface UpdateData {
  recipients?: string[];
  settings?: Record<string, unknown>;
  title?: string;
  status?: string;
  content?: string;
}

export async function PUT(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = params.id

    // Get user from database
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const contentType = request.headers.get("content-type")
    let updateData: UpdateData = {}

    if (contentType?.includes("application/json")) {
      // Handle JSON requests (for both content and recipients/settings updates)
      const body = await request.json()

      if (body.recipients !== undefined) {
        updateData.recipients = body.recipients
      }

      if (body.settings !== undefined) {
        updateData = { ...updateData, ...body.settings }
      }

      if (body.title !== undefined) {
        updateData.title = body.title
      }

      if (body.status !== undefined) {
        updateData.status = body.status
      }

      if (body.content !== undefined) {
        updateData.content = JSON.stringify(body.content)
      }
    } else {
      // Handle FormData requests (legacy support)
      const formData = await request.formData()
      const title = formData.get("title") as string
      const textNote = formData.get("textNote") as string
      const sensitiveInfo = formData.get("sensitiveInfo") as string

      if (!title?.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 })
      }

      // Handle file uploads (legacy)
      const files: File[] = []
      const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith("file_"))

      for (const [, file] of fileEntries) {
        if (file instanceof File) {
          files.push(file)
        }
      }

      // Process files (legacy base64 storage)
      const attachments = await Promise.all(
        files.map(async (file) => {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString("base64")

          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64,
          }
        }),
      )

      // Combine content
      const content = {
        textNote: textNote || "",
        sensitiveInfo: sensitiveInfo || "",
        attachments,
      }

      updateData = {
        title,
        content: JSON.stringify(content),
        status: "saved",
      }
    }

    // Update note in database
    const db = await getDatabase()
    const collection = db.collection("notes")

    const result = await collection.findOneAndUpdate(
      {
        noteId,
        userId: new ObjectId(user._id),
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      note: {
        id: result._id,
        noteId: result.noteId,
        title: result.title,
        recipients: result.recipients || [],
        updatedAt: result.updatedAt,
      },
      message: "Note updated successfully",
    })
  } catch (error) {
    console.error("Note update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update note",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const noteId = params.id

    // Get user from database
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete note from database
    const db = await getDatabase()
    const collection = db.collection("notes")

    const result = await collection.deleteOne({
      noteId,
      userId: new ObjectId(user._id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    })
  } catch (error) {
    console.error("Note deletion error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete note",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId } from "@/lib/userService"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const body = await request.json()
    const { noteId } = body

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 })
    }

    // Create a draft note entry in the database
    const db = await getDatabase()
    const collection = db.collection("notes")

    const newNote = {
      noteId, // UUID from client
      userId: new ObjectId(user._id),
      title: "", // Start with empty title, will be set when user saves
      content: {
        textNote: "",
        sensitiveInfo: "",
        attachments: [],
      },
      recipients: [],
      status: "draft",
      deliveryTrigger: "automatic",
      isDelivered: false,
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newNote)

    return NextResponse.json({
      success: true,
      note: {
        id: result.insertedId,
        noteId,
        title: "", // Empty title initially
        status: newNote.status,
        createdAt: newNote.createdAt,
      },
      message: "Draft note created successfully",
    })
  } catch (error) {
    console.error("Note creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create note",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

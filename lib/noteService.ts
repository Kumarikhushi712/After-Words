import { getDatabase } from "@/lib/mongodb"
import type { Note, CreateNoteData } from "@/lib/Note"
import { ObjectId } from "mongodb"
import { v4 as uuidv4 } from "uuid"

const COLLECTION_NAME = "notes"

export async function createNote(noteData: CreateNoteData): Promise<Note> {
  const db = await getDatabase()
  const collection = db.collection<Note>(COLLECTION_NAME)

  const newNote: Omit<Note, "_id"> = {
    ...noteData,
    noteId: uuidv4(), // Generate UUID for the note
    isEncrypted: false, // You can implement encryption later
    deliveryTrigger: noteData.deliveryTrigger || "automatic",
    isDelivered: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    priority: noteData.priority || "medium",
    status: "draft", // Default status
  }

  const result = await collection.insertOne(newNote)
  return { ...newNote, _id: result.insertedId }
}

export async function getNotesByUserId(userId: ObjectId): Promise<Note[]> {
  const db = await getDatabase()
  const collection = db.collection<Note>(COLLECTION_NAME)

  return await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
}

export async function getNoteById(noteId: string, userId: ObjectId): Promise<Note | null> {
  const db = await getDatabase()
  const collection = db.collection<Note>(COLLECTION_NAME)

  return await collection.findOne({
    _id: new ObjectId(noteId),
    userId,
  })
}

export async function updateNote(noteId: string, userId: ObjectId, updateData: Partial<Note>): Promise<Note | null> {
  const db = await getDatabase()
  const collection = db.collection<Note>(COLLECTION_NAME)

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(noteId), userId },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  return result
}

export async function deleteNote(noteId: string, userId: ObjectId): Promise<boolean> {
  const db = await getDatabase()
  const collection = db.collection<Note>(COLLECTION_NAME)

  const result = await collection.deleteOne({
    _id: new ObjectId(noteId),
    userId,
  })

  return result.deletedCount === 1
}

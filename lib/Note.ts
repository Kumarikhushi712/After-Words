import type { ObjectId } from "mongodb"

export interface Recipient {
  name: string
  email: string
  relationship?: string
}

export interface Note {
  _id?: ObjectId
  noteId: string
  userId: ObjectId
  title: string
  content: string
  status: string
  recipients: Recipient[]
  isEncrypted: boolean
  deliveryTrigger: "manual" | "automatic" | "scheduled"
  scheduledDelivery?: Date
  isDelivered: boolean
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  priority: "low" | "medium" | "high"
}

export interface CreateNoteData {
  userId: ObjectId
  title: string
  content: string
  recipients: Recipient[]
  deliveryTrigger?: "manual" | "automatic" | "scheduled"
  scheduledDelivery?: Date
  tags?: string[]
  priority?: "low" | "medium" | "high"
}

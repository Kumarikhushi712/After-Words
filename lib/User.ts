import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  createdAt: Date
  updatedAt: Date
  lastCheckIn?: Date
  checkInFrequency: "monthly" | "quarterly" | "annually"
  isActive: boolean
}

export interface CreateUserData {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  checkInFrequency?: "monthly" | "quarterly" | "annually"
}

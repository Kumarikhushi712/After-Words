import { getDatabase } from "@/lib/mongodb"
import type { User, CreateUserData } from "@/lib/User"

const COLLECTION_NAME = "users"

export async function createUser(userData: CreateUserData): Promise<User> {
  const db = await getDatabase()
  const collection = db.collection<User>(COLLECTION_NAME)

  const newUser: Omit<User, "_id"> = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastCheckIn: new Date(),
    checkInFrequency: userData.checkInFrequency || "monthly",
    isActive: true,
  }

  console.log("Creating user with data:", newUser)

  const result = await collection.insertOne(newUser)

  console.log("User created with ID:", result.insertedId)

  return { ...newUser, _id: result.insertedId }
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const db = await getDatabase()
  const collection = db.collection<User>(COLLECTION_NAME)

  console.log("Looking for user with clerkId:", clerkId)

  const user = await collection.findOne({ clerkId })

  console.log("Found user:", user ? "Yes" : "No")

  return user
}

export async function updateUser(clerkId: string, updateData: Partial<User>): Promise<User | null> {
  const db = await getDatabase()
  const collection = db.collection<User>(COLLECTION_NAME)

  console.log("Updating user with clerkId:", clerkId, "Data:", updateData)

  const result = await collection.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )

  console.log("User update result:", result ? "Success" : "Not found")

  return result
}

export async function updateLastCheckIn(clerkId: string): Promise<void> {
  const db = await getDatabase()
  const collection = db.collection<User>(COLLECTION_NAME)

  await collection.updateOne(
    { clerkId },
    {
      $set: {
        lastCheckIn: new Date(),
        updatedAt: new Date(),
      },
    },
  )
}

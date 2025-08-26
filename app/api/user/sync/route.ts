import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createUser, getUserByClerkId, updateUser } from "@/lib/userService"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already exists in our database
    const existingUser = await getUserByClerkId(userId)

    if (existingUser) {
      // Update last check-in
      await updateUser(userId, { lastCheckIn: new Date() })
      return NextResponse.json({
        success: true,
        user: existingUser,
        message: "User check-in updated",
      })
    }

    // If user doesn't exist, we need more info from the client
    return NextResponse.json({
      success: false,
      needsUserData: true,
      message: "User not found in database. Please provide user details.",
    })
  } catch (error) {
    console.error("User sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to sync user data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { email, firstName, lastName, checkInFrequency } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await getUserByClerkId(userId)

    if (existingUser) {
      // Update existing user
      const updatedUser = await updateUser(userId, {
        email,
        firstName,
        lastName,
        checkInFrequency,
        lastCheckIn: new Date(),
      })

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: "User updated successfully",
      })
    } else {
      // Create new user
      const newUser = await createUser({
        clerkId: userId,
        email,
        firstName,
        lastName,
        checkInFrequency: checkInFrequency || "monthly",
      })

      return NextResponse.json({
        success: true,
        user: newUser,
        message: "User created successfully",
      })
    }
  } catch (error) {
    console.error("User creation/update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create/update user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

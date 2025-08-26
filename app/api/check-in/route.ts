import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getUserByClerkId, updateLastCheckIn } from "@/lib/userService"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update user's last check-in time
    await updateLastCheckIn(userId)

    // Get updated user data
    const user = await getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Check-in successful",
      lastCheckIn: user.lastCheckIn,
    })
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check in",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { sendCheckInReminderEmail } from "@/lib/email"

// This endpoint will be called by a cron job or scheduler
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (cron job)
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "your-cron-secret"

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const usersCollection = db.collection("users")
    const notesCollection = db.collection("notes")

    // Find users who need check-in reminders or note delivery
    const now = new Date()
    const users = await usersCollection
      .find({
        isActive: true,
        lastCheckIn: { $exists: true },
      })
      .toArray()

    const deliveryResults: unknown[] = []
    const reminderResults: unknown[] = []

    for (const user of users) {
      const lastCheckIn = new Date(user.lastCheckIn)
      const daysSinceCheckIn = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24))

      // Find active notes for this user
      const activeNotes = await notesCollection
        .find({
          userId: user._id,
          status: "saved",
          isDelivered: { $ne: true },
        })
        .toArray()

      for (const note of activeNotes) {
        // Parse check-in period from note settings
        const checkInPeriod = note.checkInPeriod || "60 days"
        let maxDays = 60

        if (checkInPeriod === "1 minute")
          maxDays = 0 // For testing
        else if (checkInPeriod === "30 days") maxDays = 30
        else if (checkInPeriod === "60 days") maxDays = 60
        else if (checkInPeriod === "90 days") maxDays = 90

        // Check if note should be delivered
        if (daysSinceCheckIn >= maxDays && note.deliveryTrigger === "automatic") {
          try {
            // Trigger note delivery
            const deliveryResponse = await fetch(
              `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-note-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.INTERNAL_API_SECRET || "internal-secret"}`,
                },
                body: JSON.stringify({
                  noteId: note.noteId,
                  recipients: note.recipients || [],
                  noteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/view-note/${note.noteId}`,
                  internal: true,
                }),
              },
            )

            if (deliveryResponse.ok) {
              deliveryResults.push({
                noteId: note.noteId,
                userId: user._id,
                status: "delivered",
                daysSinceCheckIn,
              })
            }
          } catch (error) {
            console.error(`Failed to deliver note ${note.noteId}:`, error)
          }
        }
        // Send reminder emails
        else if (daysSinceCheckIn >= maxDays - 7 && daysSinceCheckIn < maxDays) {
          const daysRemaining = maxDays - daysSinceCheckIn

          try {
            const reminderResult = await sendCheckInReminderEmail({
              userEmail: user.email,
              userName: user.firstName || user.email.split("@")[0],
              checkInUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/notes`,
              daysRemaining,
            })

            if (reminderResult.success) {
              reminderResults.push({
                userId: user._id,
                email: user.email,
                daysRemaining,
                status: "sent",
              })
            }
          } catch (error) {
            console.error(`Failed to send reminder to ${user.email}:`, error)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${users.length} users`,
      results: {
        deliveries: deliveryResults,
        reminders: reminderResults,
      },
    })
  } catch (error) {
    console.error("Delivery check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check deliveries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

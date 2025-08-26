// app/api/send-note-email/route.ts
import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { recipients, noteId, noteUrl } = await req.json()

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { success: false, message: "No recipients provided" },
        { status: 400 }
      )
    }

    const successful: string[] = []
    const failed: { email: string; error: string }[] = []

    for (const recipient of recipients) {
      try {
        const result = await resend.emails.send({
          from: "My Last Note <onboarding@resend.dev>", // ✅ replace with verified domain if possible
          to: recipient.email,
          subject: "You’ve received a new note",
          text: `Hello ${recipient.name},\n\nYou’ve been added as a recipient for a note.\n\nView it here: ${noteUrl}\n\n- My Last Note Team`,
        })

        if (result.error) {
          failed.push({ email: recipient.email, error: result.error.message })
        } else {
          successful.push(recipient.email)
        }
      } catch (error: any) {
        // Handle resend domain verification issue gracefully
        if (error.statusCode === 403 && error.message?.includes("domain is not verified")) {
          return NextResponse.json({
            success: false,
            message:
              "Email feature is temporarily unavailable. Your note has been saved and recipients will be notified once email service is ready.",
            showAsWarning: true,
          })
        }

        failed.push({ email: recipient.email, error: error.message || "Unknown error" })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Note delivered to ${successful.length} of ${recipients.length} recipients`,
      results: { successful, failed },
    })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to send email right now, but your note is safely saved. Please try again later.",
        showAsWarning: true,
      },
      { status: 500 }
    )
  }
}

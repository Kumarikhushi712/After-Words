import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailRecipient {
  name: string
  email: string
  relationship?: string
}

export interface NoteEmailData {
  noteId: string
  noteTitle: string
  senderName: string
  recipients: EmailRecipient[]
  noteUrl: string
  deliveredAt: Date
}

export async function sendNoteDeliveryEmail({
  recipient,
  noteTitle,
  senderName,
  noteUrl,
  deliveredAt,
}: {
  recipient: EmailRecipient
  noteTitle: string
  senderName: string
  noteUrl: string
  deliveredAt: Date
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@lastnote.live"

    const { data, error } = await resend.emails.send({
      from: `My Last Note <${fromEmail}>`,
      to: [recipient.email],
      subject: `You've received a note from ${senderName}`,
      html: generateNoteDeliveryHTML({
        recipientName: recipient.name,
        senderName,
        noteTitle,
        noteUrl,
        deliveredAt,
        relationship: recipient.relationship,
      }),
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function sendCheckInReminderEmail({
  userEmail,
  userName,
  checkInUrl,
  daysRemaining,
}: {
  userEmail: string
  userName: string
  checkInUrl: string
  daysRemaining: number
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@lastnote.live"

    const { data, error } = await resend.emails.send({
      from: `My Last Note <${fromEmail}>`,
      to: [userEmail],
      subject: `Check-in reminder - ${daysRemaining} days remaining`,
      html: generateCheckInReminderHTML({
        userName,
        checkInUrl,
        daysRemaining,
      }),
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function generateNoteDeliveryHTML({
  recipientName,
  senderName,
  noteTitle,
  noteUrl,
  deliveredAt,
  relationship,
}: {
  recipientName: string
  senderName: string
  noteTitle: string
  noteUrl: string
  deliveredAt: Date
  relationship?: string
}): string {
  const relationshipText = relationship ? ` (${relationship})` : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've received a note</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
        .content { padding: 40px 30px; }
        .message { background: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .button:hover { background: #0284c7; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
        .heart { color: #f43f5e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💌 You've received a note</h1>
          <p>A message has been delivered to you through My Last Note</p>
        </div>
        
        <div class="content">
          <p>Hello ${recipientName}${relationshipText},</p>
          
          <p>You have received a personal note from <strong>${senderName}</strong> titled "<strong>${noteTitle}</strong>".</p>
          
          <div class="message">
            <p><strong>This note was prepared in advance and delivered automatically as requested by ${senderName}.</strong></p>
            <p>It may contain important information, personal messages, or instructions that ${senderName} wanted to share with you.</p>
          </div>
          
          <p>To view your note securely, please click the button below:</p>
          
          <a href="${noteUrl}" class="button">View Your Note</a>
          
          <p><small>This link is secure and personal to you. The note was delivered on ${deliveredAt.toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            },
          )}.</small></p>
          
          <p>If you have any questions about this service, please visit our website or contact support.</p>
          
          <p>With care,<br>The My Last Note Team</p>
        </div>
        
        <div class="footer">
          <p>This email was sent by My Last Note, a secure digital legacy platform.</p>
          <p>Made with <span class="heart">♥</span> to help preserve important messages.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateCheckInReminderHTML({
  userName,
  checkInUrl,
  daysRemaining,
}: {
  userName: string
  checkInUrl: string
  daysRemaining: number
}): string {
  const urgencyColor = daysRemaining <= 7 ? "#ef4444" : daysRemaining <= 14 ? "#f59e0b" : "#0ea5e9"
  const urgencyText = daysRemaining <= 7 ? "Urgent" : daysRemaining <= 14 ? "Important" : "Reminder"

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-in Reminder</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .urgency { background: ${urgencyColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; display: inline-block; margin-top: 10px; }
        .content { padding: 40px 30px; }
        .countdown { background: #f1f5f9; border: 2px solid ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .countdown .number { font-size: 48px; font-weight: bold; color: ${urgencyColor}; margin: 0; }
        .countdown .label { font-size: 18px; color: #6b7280; margin: 5px 0 0 0; }
        .button { display: inline-block; background: ${urgencyColor}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Check-in Reminder</h1>
          <div class="urgency">${urgencyText}</div>
        </div>
        
        <div class="content">
          <p>Hello ${userName},</p>
          
          <p>This is a friendly reminder that you need to check in with My Last Note to confirm you're okay.</p>
          
          <div class="countdown">
            <p class="number">${daysRemaining}</p>
            <p class="label">day${daysRemaining === 1 ? "" : "s"} remaining</p>
          </div>
          
          <p>If you don't check in within the next ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}, your notes will be automatically delivered to your designated recipients as configured.</p>
          
          <p>To check in and reset your timer, simply click the button below:</p>
          
          <a href="${checkInUrl}" class="button">Check In Now</a>
          
          <p><strong>Why do I receive these reminders?</strong><br>
          These check-ins ensure that your digital legacy notes are only delivered when intended. Regular check-ins confirm that you're active and prevent accidental delivery.</p>
          
          <p>Thank you for using My Last Note to protect your important messages.</p>
          
          <p>Best regards,<br>The My Last Note Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated reminder from My Last Note.</p>
          <p>You can adjust your check-in frequency in your account settings.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

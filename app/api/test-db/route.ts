import { NextResponse } from "next/server"
import { testConnection, getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    // Test the connection
    const connectionTest = await testConnection()

    if (!connectionTest.success) {
      return NextResponse.json({ error: connectionTest.message }, { status: 500 })
    }

    // Get database info
    const db = await getDatabase()
    const admin = db.admin()
    const serverStatus = await admin.serverStatus()

    // Get database stats
    const stats = await db.stats()

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful!",
      database: {
        name: db.databaseName,
        collections: stats.collections || 0,
        dataSize: stats.dataSize || 0,
        storageSize: stats.storageSize || 0,
      },
      server: {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        host: serverStatus.host,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test database connection",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

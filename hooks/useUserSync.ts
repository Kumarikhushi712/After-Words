"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"

export function useUserSync() {
  const { user, isLoaded } = useUser()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user) return

      setIsSyncing(true)
      setSyncError(null)

      try {
        // First, try to sync/check existing user
        const syncResponse = await fetch("/api/user/sync", {
          method: "POST",
        })

        const syncResult = await syncResponse.json()

        if (syncResult.needsUserData) {
          // User doesn't exist, create them
          const createResponse = await fetch("/api/user/sync", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.emailAddresses[0]?.emailAddress,
              firstName: user.firstName,
              lastName: user.lastName,
              checkInFrequency: "monthly", // default
            }),
          })

          const createResult = await createResponse.json()

          if (!createResult.success) {
            throw new Error(createResult.error || "Failed to create user")
          }

          console.log("User created successfully:", createResult.user)
        } else if (syncResult.success) {
          console.log("User sync successful:", syncResult.user)
        } else {
          throw new Error(syncResult.error || "Failed to sync user")
        }
      } catch (error) {
        console.error("User sync error:", error)
        setSyncError(error instanceof Error ? error.message : "Unknown error")
      } finally {
        setIsSyncing(false)
      }
    }

    syncUser()
  }, [user, isLoaded])

  return { isSyncing, syncError }
}

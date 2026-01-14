/**
 * CHANGE: Created root page that redirects to marketplace
 * Serves as the landing page entry point for the application
 */

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to marketplace as the main entry point
    router.push("/marketplace")
  }, [router])

  return null
}

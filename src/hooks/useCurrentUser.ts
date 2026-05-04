import { useState, useEffect } from "react"
import { api } from "../lib/api"

/**
 * Returns the current logged-in user data from localStorage.
 * Falls back to fetching from /me API if not cached.
 */
export function useCurrentUser() {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Try localStorage first for an immediate initial state
        const cached = localStorage.getItem("user")
        if (cached) {
            try {
                setUser(JSON.parse(cached))
                // Do not set isLoading(false) here, wait for fresh fetch
            } catch {}
        }

        // Always fetch fresh from API to get latest updates (like newly created orgId)
        const fetchUser = async () => {
            try {
                const res = await api.getMe()
                if (res?.data) {
                    setUser(res.data)
                    localStorage.setItem("user", JSON.stringify(res.data))
                }
            } catch (err) {
                console.error("Failed to fetch current user", err)
            } finally {
                setIsLoading(false)
            }
        }
        
        fetchUser()
    }, [])

    const orgId = user?.org_public_id || null
    const role = user?.role || "user"

    return { user, orgId, role, isLoading }
}

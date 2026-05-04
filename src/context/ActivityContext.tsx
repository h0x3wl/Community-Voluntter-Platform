import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Activity } from "../types/activity"
import { addActivity as persistActivity, getActivities, STORAGE_KEY } from "../shared/activityService"

type ActivityInput = Omit<Activity, "id" | "createdAt">

type ActivityContextValue = {
  activities: Activity[]
  addActivity: (activity: ActivityInput) => void
  logActivity: (action: string, target?: string) => void
}

const ACTIVITY_LOG_DEDUPE_KEY = "last_activity_signature"

export const ActivityContext = createContext<ActivityContextValue | undefined>(undefined)

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(() => getActivities())

  useEffect(() => {
    const reloadFromStorage = () => {
      setActivities(getActivities())
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) {
        reloadFromStorage()
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const addActivity = useCallback((activity: ActivityInput) => {
    const nextActivity: Activity = {
      ...activity,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    const updated = persistActivity(nextActivity)
    setActivities(updated)
  }, [])

  const logActivity = useCallback(
    (action: string, target?: string) => {
      const currentUser = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "{}")
        } catch {
          return {}
        }
      })()

      const actorType: Activity["actorType"] =
        currentUser?.role === "org_admin" ? "organization" : "user"
      const actorId =
        actorType === "organization"
          ? String(
              currentUser?.org_public_id ||
                currentUser?.organization_public_id ||
                currentUser?.organization_id ||
                currentUser?.org_id ||
                "unknown-org"
            )
          : String(currentUser?.public_id || currentUser?.id || "anonymous")

      const signature = `${actorId}|${actorType}|${action}|${target || ""}`
      const nowMs = Date.now()

      try {
        const raw = sessionStorage.getItem(ACTIVITY_LOG_DEDUPE_KEY)
        const parsed = raw ? (JSON.parse(raw) as { signature?: string; at?: number }) : null
        if (parsed?.signature === signature && typeof parsed.at === "number" && nowMs - parsed.at < 2000) {
          return
        }
        sessionStorage.setItem(
          ACTIVITY_LOG_DEDUPE_KEY,
          JSON.stringify({
            signature,
            at: nowMs,
          })
        )
      } catch {
        // Ignore sessionStorage failures and continue logging.
      }

      addActivity({
        actorId,
        actorType,
        action,
        target,
      })
    },
    [addActivity]
  )

  const value = useMemo(
    () => ({
      activities,
      addActivity,
      logActivity,
    }),
    [activities, addActivity, logActivity]
  )

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>
}

export function useActivity() {
  const context = useContext(ActivityContext)
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider")
  }
  return context
}

// Compatibility alias for existing code paths that import useActivities.
export const useActivities = useActivity

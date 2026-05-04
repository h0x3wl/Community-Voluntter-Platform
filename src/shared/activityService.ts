import type { Activity } from "../types/activity"

export const STORAGE_KEY = "global_activities"

export function getActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Activity[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Failed to read activities from localStorage", error)
    return []
  }
}

export function addActivity(activity: Activity): Activity[] {
  try {
    const current = getActivities()
    const next = [activity, ...current]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    console.log(`[activityService] Added activity to ${STORAGE_KEY}`, activity)
    return next
  } catch (error) {
    console.error("Failed to save activity to localStorage", error)
    return getActivities()
  }
}

/**
 * Mock user activity audit log (no backend).
 * Real integration: GET /me/activities with rows shaped like UserAuditActivity.
 */

export type UserActivityEntityType = "event" | "profile" | "application" | "post"

export interface UserAuditActivity {
  id: string
  userId: string
  action: string
  entityType: UserActivityEntityType
  entityTitle?: string
  createdAt: string
  metadata?: Record<string, unknown>
}

/** Template rows omit id/userId; bound to logged-in user in getMockActivitiesForUser */
type ActivityTemplate = Omit<UserAuditActivity, "id" | "userId">

const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()

const templates: ActivityTemplate[] = [
  {
    action: "Joined an event",
    entityType: "event",
    entityTitle: "Community Weekend Clean-up",
    createdAt: minutesAgo(25),
    metadata: { slug: "community-weekend-clean-up", location: "Downtown Hub" },
  },
  {
    action: "Created an event",
    entityType: "event",
    entityTitle: "Blanket Drive 2026",
    createdAt: minutesAgo(90),
    metadata: { slug: "blanket-drive-2026" },
  },
  {
    action: "Applied to volunteer",
    entityType: "application",
    entityTitle: "Food Packing — Saturday shift",
    createdAt: hoursAgo(5),
    metadata: { opportunityId: "opp_food_sat" },
  },
  {
    action: "Updated profile",
    entityType: "profile",
    entityTitle: "Contact & notifications",
    createdAt: hoursAgo(14),
    metadata: { fields: ["phone", "email_notifications"] },
  },
  {
    action: "Liked a post",
    entityType: "post",
    entityTitle: "Thank you donors — winter campaign",
    createdAt: hoursAgo(22),
    metadata: { postId: "post_winter_thanks", campaignSlug: "winter-relief-2026" },
  },
  {
    action: "Commented on a post",
    entityType: "post",
    entityTitle: "Orientation FAQ thread",
    createdAt: daysAgo(1),
    metadata: { postId: "post_orientation_faq" },
  },
  {
    action: "Cancelled participation",
    entityType: "event",
    entityTitle: "Youth Mentor Meetup",
    createdAt: daysAgo(1),
    metadata: { slug: "youth-mentor-meetup", reason: "Schedule conflict" },
  },
  {
    action: "Submitted volunteer application follow-up",
    entityType: "application",
    entityTitle: "Background check documents",
    createdAt: daysAgo(3),
    metadata: { documentType: "id_scan" },
  },
  {
    action: "Updated profile photo",
    entityType: "profile",
    createdAt: daysAgo(5),
    metadata: {},
  },
  {
    action: "Joined an event",
    entityType: "event",
    entityTitle: "Fundraising Gala Setup",
    createdAt: daysAgo(8),
    metadata: { slug: "fundraising-gala-setup" },
  },
  {
    action: "Liked a post",
    entityType: "post",
    entityTitle: "New badges are live!",
    createdAt: daysAgo(12),
    metadata: {},
  },
  {
    action: "Created an event",
    entityType: "event",
    entityTitle: "Neighborhood Meal Share",
    createdAt: daysAgo(20),
    metadata: { slug: "neighborhood-meal-share" },
  },
]

/** Deterministic-ish id suffix from userKey so SSR-like stability per user */
export function getMockActivitiesForUser(userPublicId: string): UserAuditActivity[] {
  const key = userPublicId || "anonymous"
  return templates.map((t, i) => ({
    ...t,
    id: `${key}-audit-${String(i).padStart(3, "0")}`,
    userId: key,
  }))
}

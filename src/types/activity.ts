export type Activity = {
  id: string
  actorId: string
  actorType: "user" | "organization"
  action: string
  target?: string
  createdAt: string
  isRead?: boolean
}

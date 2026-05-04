import { Link } from "react-router-dom"
import {
  Building2,
  Bell,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react"
import { cn } from "../../lib/utils"
import type { Activity } from "../../types/activity"

function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const mins = Math.floor(diff / (60 * 1000))
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

function actorPalette(actorType: Activity["actorType"]) {
  return actorType === "organization"
    ? {
        badge: "bg-emerald-50 text-emerald-700",
        circleBg: "bg-emerald-50",
        circleFg: "text-emerald-600",
        labelIcon: Building2,
      }
    : {
        badge: "bg-blue-50 text-blue-700",
        circleBg: "bg-blue-50",
        circleFg: "text-blue-600",
        labelIcon: Bell,
      }
}

function actionGlyph(activity: Activity): LucideIcon {
  if (activity.isRead) return CheckCircle2
  return actorPalette(activity.actorType).labelIcon
}

function resolveTargetLink(activity: Activity): string | undefined {
  return activity.target?.startsWith("/") ? activity.target : undefined
}

function GlyphIcon({
  glyph: G,
  className,
}: {
  glyph: LucideIcon
  className?: string
}) {
  return <G className={className} aria-hidden />
}

export function ActivityItem({ activity }: { activity: Activity }) {
  const glyph = actionGlyph(activity)
  const palette = actorPalette(activity.actorType)
  const href = resolveTargetLink(activity)
  const labelTarget = activity.target?.replace(/^\//, "") || "General"

  return (
    <div
      className={cn(
        "relative flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm",
        "transition-all duration-200 hover:border-gray-200 hover:bg-gray-50/40 hover:shadow-md"
      )}
    >
      <div className="pointer-events-none absolute bottom-3 left-[41px] top-[68px] hidden w-px bg-gray-100 sm:block" />

      <div className="mt-0.5 flex-shrink-0">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full border border-white shadow-sm ring-1 ring-black/5",
            palette.circleBg
          )}
        >
          <GlyphIcon glyph={glyph} className={cn("h-5 w-5", palette.circleFg)} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold leading-snug text-gray-900">{activity.action}</p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-gray-600">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  palette.badge
                )}
              >
                {activity.actorType}
              </span>
              <span className="hidden text-gray-200 sm:inline" aria-hidden>
                •
              </span>
              <span className="sr-only">Related item:</span>
              {href ? (
                <Link
                  to={href}
                  className="font-semibold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
                >
                  {labelTarget}
                </Link>
              ) : (
                <span className="font-semibold text-gray-700">{labelTarget}</span>
              )}
            </div>

            <p className="flex flex-wrap items-center gap-2 pt-2 text-xs text-gray-400">
              <GlyphIcon glyph={palette.labelIcon} className="h-3.5 w-3.5 shrink-0" />
              <span className="font-bold uppercase tracking-wide text-gray-500">{timeAgo(activity.createdAt)}</span>
              <span className="text-gray-200">•</span>
              <span className="tabular-nums text-gray-500">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

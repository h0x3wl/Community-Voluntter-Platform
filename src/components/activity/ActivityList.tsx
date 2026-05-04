import { ActivityItem } from "./ActivityItem"
import type { Activity } from "../../types/activity"

type ActivityListProps = {
  activities?: Activity[]
  rows?: Activity[]
  loading?: boolean
  visibleCount?: number
  onLoadMore?: () => void
  loadingText?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function ActivityList({
  activities,
  rows,
  loading = false,
  visibleCount = 8,
  onLoadMore,
  loadingText = "Loading activity...",
  emptyTitle = "No activity yet",
  emptyDescription = "Your activity will appear here.",
}: ActivityListProps) {
  const source = rows ?? activities ?? []
  const visibleRows = source.slice(0, visibleCount)
  const hasMore = source.length > visibleRows.length

  if (loading) {
    return <p className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-500">{loadingText}</p>
  }

  if (source.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-gray-900">{emptyTitle}</h3>
        <p className="mt-2 text-sm text-gray-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visibleRows.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}

      {hasMore && onLoadMore ? (
        <div className="pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Load more
          </button>
        </div>
      ) : null}
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { CalendarRange, Download, Filter, History, Search } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { ActivityList } from "../components/activity/ActivityList"
import { useActivities } from "../hooks/useActivities"
import type { Activity } from "../types/activity"

const PAGE_SIZE = 8

function localYmd(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function parseYmdToEndOfDay(ymd: string): number {
  const [y, mo, da] = ymd.split("-").map(Number)
  const d = new Date(y, mo - 1, da, 23, 59, 59, 999)
  return d.getTime()
}

function parseYmdToStartOfDay(ymd: string): number {
  const [y, mo, da] = ymd.split("-").map(Number)
  const d = new Date(y, mo - 1, da, 0, 0, 0, 0)
  return d.getTime()
}

function exportCsv(rows: Activity[]) {
  const header = ["id", "actorId", "actorType", "action", "target", "createdAt", "isRead"]
  const lines = rows.map((r) =>
    [
      r.id,
      r.actorId,
      r.actorType,
      r.action,
      r.target ?? "",
      r.createdAt,
      r.isRead ? "true" : "false",
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",")
  )
  const csv = [header.join(","), ...lines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `activity-history-${localYmd(new Date())}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ActivityPage() {
  const { user } = useOutletContext<{ user: any }>()
  const actorType = user?.role === "org_admin" ? "organization" : "user"
  const actorId =
    actorType === "organization"
      ? String(user?.org_public_id ?? user?.organization_public_id ?? user?.organization_id ?? user?.org_id ?? "")
      : String(user?.public_id ?? user?.id ?? "")
  const { activities } = useActivities()

  const [loading] = useState(false)
  const [query, setQuery] = useState("")
  const [entityFilter, setEntityFilter] = useState<"user" | "organization" | "all">("all")
  const [rangeFrom, setRangeFrom] = useState("")
  const [rangeTo, setRangeTo] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, entityFilter, rangeFrom, rangeTo, actorId, actorType])

  const allRows = useMemo(
    () =>
      activities
        .filter((item) => item.actorId === actorId && item.actorType === actorType)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [activities, actorId, actorType]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRows.filter((r) => {
      if (entityFilter !== "all" && r.actorType !== entityFilter) return false
      const ms = Date.parse(r.createdAt)
      if (rangeFrom) {
        if (ms < parseYmdToStartOfDay(rangeFrom)) return false
      }
      if (rangeTo) {
        if (ms > parseYmdToEndOfDay(rangeTo)) return false
      }
      if (!q) return true
      const hay = `${r.action} ${r.target ?? ""}`.toLowerCase()
      return hay.includes(q)
    })
  }, [allRows, entityFilter, query, rangeFrom, rangeTo])

  const handleExport = useCallback(() => exportCsv(filtered), [filtered])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-blue-600">
            <History className="h-6 w-6" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-wider">Audit log</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Your activity history</h1>
          <p className="text-gray-500">
            A complete record of actions you&apos;ve taken on the platform—notifications are separate.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 rounded-xl border-gray-200"
          disabled={loading || filtered.length === 0}
          onClick={() => handleExport()}
        >
          <Download className="mr-2 h-4 w-4" aria-hidden />
          Export activity
        </Button>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setVisibleCount(PAGE_SIZE)
            }}
            placeholder="Search actions or titles..."
            disabled={loading}
            className="h-12 rounded-xl border-gray-100 bg-gray-50 pl-9 transition-all focus:bg-white"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value as "user" | "organization" | "all")
                setVisibleCount(PAGE_SIZE)
              }}
              disabled={loading}
              className="h-12 w-full min-w-[200px] appearance-none rounded-xl border border-gray-100 bg-gray-50 py-2 pl-9 pr-10 text-sm font-medium text-gray-700 transition-all focus:border-blue-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-auto"
            >
              <option value="all">All actor types</option>
              <option value="user">User</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={rangeFrom}
                onChange={(e) => {
                  setRangeFrom(e.target.value)
                  setVisibleCount(PAGE_SIZE)
                }}
                disabled={loading}
                className="h-12 w-full min-w-[150px] rounded-xl border-gray-100 bg-gray-50 pl-9 text-sm font-medium sm:w-[170px]"
              />
            </div>
            <span className="hidden text-gray-300 sm:inline">—</span>
            <div className="relative">
              <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={rangeTo}
                onChange={(e) => {
                  setRangeTo(e.target.value)
                  setVisibleCount(PAGE_SIZE)
                }}
                disabled={loading}
                className="h-12 w-full min-w-[150px] rounded-xl border-gray-100 bg-gray-50 pl-9 text-sm font-medium sm:w-[170px]"
              />
            </div>
          </div>
        </div>
      </div>

      <ActivityList
        loading={loading}
        activities={filtered}
        visibleCount={visibleCount}
        onLoadMore={() => setVisibleCount((n) => n + PAGE_SIZE)}
        loadingText="Loading activity..."
        emptyTitle="No activity yet"
        emptyDescription="Your activity updates appear here in real time."
      />
    </div>
  )
}

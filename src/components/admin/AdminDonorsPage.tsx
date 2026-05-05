import { useEffect, useState } from "react"
import { Input } from "../ui/input"
import {
    Users,
    Heart,
    Search,
    Download,
    ArrowUpRight,
    DollarSign,
    Calendar,
    TrendingUp,
    Mail,
    ChevronDown,
    ChevronUp,
    BarChart3,
    Loader2,
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

type SortKey = "total_cents" | "last_donated_at" | "donor_name"
type SortDir = "asc" | "desc"

export function AdminDonorsPage() {
    const { orgId } = useCurrentUser()
    const [donors, setDonors] = useState<any[]>([])
    const [overview, setOverview] = useState<any>(null)
    const [totalAmountCents, setTotalAmountCents] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortKey, setSortKey] = useState<SortKey>("total_cents")
    const [sortDir, setSortDir] = useState<SortDir>("desc")
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [donorRes, overRes] = await Promise.all([
                    api.getOrgDonors(orgId).catch(() => null),
                    api.getOrgOverview(orgId).catch(() => null)
                ])
                if (donorRes?.data) {
                    const donorData = donorRes.data.recent_donors || donorRes.data
                    setDonors(Array.isArray(donorData) ? donorData : [])
                    setTotalAmountCents(donorRes.data.total_amount_cents || 0)
                    setTotalCount(donorRes.data.total_count || 0)
                }
                if (overRes?.data) setOverview(overRes.data)
            } catch (err) {
                console.error("Failed to fetch donor page data", err)
            } finally {
                setIsLoading(false)
            }
        }
        if (orgId) fetchAll()
    }, [orgId])

    const totalRaised = totalAmountCents / 100
    const avgDonation = donors.length > 0 ? (totalAmountCents / 100) / donors.length : 0

    // Most recent donor
    const lastDonorDate = donors.reduce((latest: string | null, d: any) => {
        if (!latest || (d.last_donated_at && new Date(d.last_donated_at) > new Date(latest))) return d.last_donated_at
        return latest
    }, null)

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc")
        } else {
            setSortKey(key)
            setSortDir("desc")
        }
    }

    const filtered = donors
        .filter((d: any) => {
            if (!searchQuery) return true
            const q = searchQuery.toLowerCase()
            return (d.donor_name || "").toLowerCase().includes(q)
                || (d.donor_email || "").toLowerCase().includes(q)
        })
        .sort((a: any, b: any) => {
            let aVal = a[sortKey] ?? ""
            let bVal = b[sortKey] ?? ""
            if (sortKey === "total_cents") {
                aVal = Number(aVal)
                bVal = Number(bVal)
                return sortDir === "desc" ? bVal - aVal : aVal - bVal
            }
            if (sortKey === "last_donated_at") {
                aVal = aVal ? new Date(aVal).getTime() : 0
                bVal = bVal ? new Date(bVal).getTime() : 0
                return sortDir === "desc" ? bVal - aVal : aVal - bVal
            }
            return sortDir === "asc"
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal))
        })

    const handleExport = () => {
        const headers = ["Name", "Email", "Total Donated ($)", "Last Donation Date"]
        const rows = filtered.map((d: any) => [
            d.donor_name || "Anonymous",
            d.donor_email || "",
            ((d.total_cents || 0) / 100).toFixed(2),
            d.last_donated_at ? new Date(d.last_donated_at).toLocaleDateString() : "—",
        ])
        const csv = [headers, ...rows].map(row => row.map((c: string) => `"${c}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `donors-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const SortIcon = ({ col }: { col: SortKey }) =>
        sortKey === col
            ? sortDir === "desc"
                ? <ChevronDown className="w-3.5 h-3.5 text-blue-500 inline ml-1" />
                : <ChevronUp className="w-3.5 h-3.5 text-blue-500 inline ml-1" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-300 inline ml-1" />

    // Percentage of total per donor (for bar visualization)
    const maxDonorCents = donors.reduce((m: number, d: any) => Math.max(m, d.total_cents || 0), 1)

    return (
        <div className="space-y-8 relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Loading donors…</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
                    <p className="text-gray-500 mt-1">View and track your organization's supporter base.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 bg-white transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4 text-gray-500" />
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Donors</p>
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{(totalCount || donors.length).toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-1">Unique contributors</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Raised</p>
                        <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">All time donations</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Donation</p>
                        <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">
                        ${avgDonation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Per donor average</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active This Month</p>
                        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                            <Heart className="w-4 h-4 text-rose-500" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{overview?.active_donors ?? "—"}</h3>
                    {(overview?.active_donors ?? 0) > 0 && (
                        <p className="text-xs font-bold text-green-600 flex items-center gap-1 mt-1">
                            <ArrowUpRight className="w-3 h-3" /> Active donors
                        </p>
                    )}
                </div>
            </div>

            {/* Donors Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Controls */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name or email…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-300 rounded-xl transition-all"
                        />
                    </div>
                    <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        Showing <span className="text-gray-700 font-bold">{filtered.length}</span> of <span className="text-gray-700 font-bold">{donors.length}</span> donors
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/60 border-b border-gray-100">
                            <tr>
                                <th className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                <th
                                    onClick={() => handleSort("donor_name")}
                                    className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none"
                                >
                                    Donor <SortIcon col="donor_name" />
                                </th>
                                <th className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th
                                    onClick={() => handleSort("last_donated_at")}
                                    className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none"
                                >
                                    Last Donation <SortIcon col="last_donated_at" />
                                </th>
                                <th
                                    onClick={() => handleSort("total_cents")}
                                    className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none text-right"
                                >
                                    Total Donated <SortIcon col="total_cents" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400">
                                        <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                        <p className="font-semibold text-gray-500 mb-1">No donors found</p>
                                        <p className="text-sm">{searchQuery ? "Try adjusting your search." : "Share your campaigns to start receiving donations!"}</p>
                                    </td>
                                </tr>
                            )}
                            {filtered.map((donor: any, i: number) => {
                                const totalAmount = (donor.total_cents || 0) / 100
                                const barWidth = maxDonorCents > 0 ? Math.round(((donor.total_cents || 0) / maxDonorCents) * 100) : 0
                                const initials = (donor.donor_name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                                const isExpanded = expandedRow === (donor.donor_user_id || String(i))
                                const avatarColors = [
                                    "bg-blue-100 text-blue-700",
                                    "bg-purple-100 text-purple-700",
                                    "bg-green-100 text-green-700",
                                    "bg-rose-100 text-rose-700",
                                    "bg-amber-100 text-amber-700",
                                ]
                                const colorClass = avatarColors[i % avatarColors.length]

                                return (
                                    <>
                                        <tr
                                            key={donor.donor_user_id || i}
                                            onClick={() => setExpandedRow(isExpanded ? null : (donor.donor_user_id || String(i)))}
                                            className="hover:bg-gray-50/70 transition-colors cursor-pointer group"
                                        >
                                            {/* Rank */}
                                            <td className="py-4 px-6">
                                                <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                                            </td>

                                            {/* Donor */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colorClass}`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {donor.donor_name || "Anonymous Donor"}
                                                        </p>
                                                        {i === 0 && (
                                                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 w-fit mt-0.5">
                                                                <TrendingUp className="w-2.5 h-2.5" /> Top Donor
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="py-4 px-6">
                                                {donor.donor_email ? (
                                                    <a
                                                        href={`mailto:${donor.donor_email}`}
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                        <span className="truncate max-w-[180px]">{donor.donor_email}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">No email</span>
                                                )}
                                            </td>

                                            {/* Last Donation */}
                                            <td className="py-4 px-6">
                                                {donor.last_donated_at ? (
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium">{new Date(donor.last_donated_at).toLocaleDateString()}</p>
                                                            <p className="text-[10px] text-gray-400">
                                                                {new Date(donor.last_donated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>

                                            {/* Total */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-sm font-bold text-gray-900">
                                                        ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    {/* Progress bar relative to top donor */}
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-400 rounded-full transition-all duration-500"
                                                            style={{ width: `${barWidth}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-gray-400">{barWidth}% of top</span>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Detail Row */}
                                        {isExpanded && (
                                            <tr key={`expanded-${donor.donor_user_id || i}`} className="bg-blue-50/30">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Donor Name</p>
                                                            <p className="text-sm font-semibold text-gray-900">{donor.donor_name || "Anonymous"}</p>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
                                                            <p className="text-sm font-semibold text-gray-900 break-all">{donor.donor_email || "Not provided"}</p>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Total Contributed</p>
                                                            <p className="text-sm font-bold text-green-700">
                                                                ${((donor.total_cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </p>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Last Donation</p>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                {donor.last_donated_at ? new Date(donor.last_donated_at).toLocaleString() : "—"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{filtered.length}</span> donors · Total raised:{" "}
                        <span className="font-semibold text-gray-700">
                            ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </p>
                    <p className="text-xs text-gray-400">Click a row to expand details</p>
                </div>
            </div>
        </div>
    )
}

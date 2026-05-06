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
    Hash,
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

type SortKey = "amount_cents" | "donated_at" | "donor_name"
type SortDir = "asc" | "desc"

interface DonationRow {
    id: string
    donor_name: string
    donor_email: string
    amount_cents: number
    campaign?: string
    donated_at: string
    status: string
}

export function AdminDonorsPage() {
    const { orgId } = useCurrentUser()
    const [donations, setDonations] = useState<DonationRow[]>([])
    const [overview, setOverview] = useState<any>(null)
    const [totalAmountCents, setTotalAmountCents] = useState(0)
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [sortKey, setSortKey] = useState<SortKey>("donated_at")
    const [sortDir, setSortDir] = useState<SortDir>("desc")

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [donorRes, overRes] = await Promise.all([
                    api.getOrgDonors(orgId).catch(() => null),
                    api.getOrgOverview(orgId).catch(() => null)
                ])
                if (donorRes?.data) {
                    const donorData = donorRes.data.recent_donors || donorRes.data
                    setTotalAmountCents(donorRes.data.total_amount_cents || 0)
                    setTotalCount(donorRes.data.total_count || 0)

                    // Backend now returns individual donation rows directly
                    const rows: DonationRow[] = Array.isArray(donorData)
                        ? donorData.map((d: any, i: number) => ({
                            id: d.public_id || String(i),
                            donor_name: d.donor_name || "Anonymous",
                            donor_email: d.donor_email || "",
                            amount_cents: d.amount_cents || 0,
                            campaign: d.campaign || "General Fund",
                            donated_at: d.donated_at || "",
                            status: d.status || "completed",
                        }))
                        : []
                    setDonations(rows)
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
    const avgDonation = donations.length > 0 ? (totalAmountCents / 100) / donations.length : 0

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === "asc" ? "desc" : "asc")
        } else {
            setSortKey(key)
            setSortDir("desc")
        }
    }

    const filtered = donations
        .filter((d: DonationRow) => {
            if (!searchQuery) return true
            const q = searchQuery.toLowerCase()
            return (d.donor_name || "").toLowerCase().includes(q)
                || (d.donor_email || "").toLowerCase().includes(q)
                || (d.campaign || "").toLowerCase().includes(q)
        })
        .sort((a: DonationRow, b: DonationRow) => {
            if (sortKey === "amount_cents") {
                return sortDir === "desc" ? b.amount_cents - a.amount_cents : a.amount_cents - b.amount_cents
            }
            if (sortKey === "donated_at") {
                const aT = a.donated_at ? new Date(a.donated_at).getTime() : 0
                const bT = b.donated_at ? new Date(b.donated_at).getTime() : 0
                return sortDir === "desc" ? bT - aT : aT - bT
            }
            return sortDir === "asc"
                ? String(a[sortKey]).localeCompare(String(b[sortKey]))
                : String(b[sortKey]).localeCompare(String(a[sortKey]))
        })

    const handleExport = () => {
        const headers = ["#", "Donor Name", "Email", "Campaign", "Amount ($)", "Date", "Status"]
        const rows = filtered.map((d: DonationRow, i: number) => [
            String(i + 1),
            d.donor_name || "Anonymous",
            d.donor_email || "",
            d.campaign || "General Fund",
            ((d.amount_cents || 0) / 100).toFixed(2),
            d.donated_at ? new Date(d.donated_at).toLocaleDateString() : "—",
            d.status || "completed",
        ])
        const csv = [headers, ...rows].map(row => row.map((c: string) => `"${c}"`).join(",")).join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `donations-${new Date().toISOString().slice(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const SortIcon = ({ col }: { col: SortKey }) =>
        sortKey === col
            ? sortDir === "desc"
                ? <ChevronDown className="w-3.5 h-3.5 text-blue-500 inline ml-1" />
                : <ChevronUp className="w-3.5 h-3.5 text-blue-500 inline ml-1" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-300 inline ml-1" />

    const avatarColors = [
        "bg-blue-100 text-blue-700",
        "bg-purple-100 text-purple-700",
        "bg-green-100 text-green-700",
        "bg-rose-100 text-rose-700",
        "bg-amber-100 text-amber-700",
    ]

    return (
        <div className="space-y-8 relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-2xl">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                        <span className="text-sm font-medium">Loading donations…</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
                    <p className="text-gray-500 mt-1">All individual donations your organization has received.</p>
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
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Donations</p>
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Hash className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{(totalCount || donations.length).toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-1">Individual transactions</p>
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
                    <p className="text-xs text-gray-500 mt-1">Per transaction average</p>
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

            {/* Donations Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Controls */}
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by donor, email, or campaign…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-gray-50 border-gray-100 focus:bg-white focus:border-blue-300 rounded-xl transition-all"
                        />
                    </div>
                    <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        Showing <span className="text-gray-700 font-bold">{filtered.length}</span> of <span className="text-gray-700 font-bold">{donations.length}</span> donations
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
                                <th className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                                <th
                                    onClick={() => handleSort("donated_at")}
                                    className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none"
                                >
                                    Date <SortIcon col="donated_at" />
                                </th>
                                <th
                                    onClick={() => handleSort("amount_cents")}
                                    className="py-3.5 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none text-right"
                                >
                                    Amount <SortIcon col="amount_cents" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400">
                                        <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                        <p className="font-semibold text-gray-500 mb-1">No donations found</p>
                                        <p className="text-sm">{searchQuery ? "Try adjusting your search." : "Share your campaigns to start receiving donations!"}</p>
                                    </td>
                                </tr>
                            )}
                            {filtered.map((donation: DonationRow, i: number) => {
                                const amount = (donation.amount_cents || 0) / 100
                                const initials = (donation.donor_name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
                                const colorClass = avatarColors[i % avatarColors.length]

                                return (
                                    <tr
                                        key={donation.id || i}
                                        className="hover:bg-gray-50/70 transition-colors group"
                                    >
                                        {/* Index */}
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
                                                        {donation.donor_name || "Anonymous Donor"}
                                                    </p>
                                                    {i === 0 && (
                                                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 w-fit mt-0.5">
                                                            <TrendingUp className="w-2.5 h-2.5" /> Top Donation
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 px-6">
                                            {donation.donor_email ? (
                                                <a
                                                    href={`mailto:${donation.donor_email}`}
                                                    className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                                                >
                                                    <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                                                    <span className="truncate max-w-[180px]">{donation.donor_email}</span>
                                                </a>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No email</span>
                                            )}
                                        </td>

                                        {/* Campaign */}
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-600 font-medium">
                                                {donation.campaign || "General Fund"}
                                            </span>
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 px-6">
                                            {donation.donated_at ? (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium">{new Date(donation.donated_at).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {new Date(donation.donated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>

                                        {/* Amount */}
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-sm font-bold text-gray-900">
                                                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <p className="text-[10px] text-green-600 font-semibold mt-0.5">Completed</p>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">{filtered.length}</span> donations · Total raised:{" "}
                        <span className="font-semibold text-gray-700">
                            ${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

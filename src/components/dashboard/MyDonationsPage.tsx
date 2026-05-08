import { Input } from "../ui/input"
import { Search, ChevronLeft, ChevronRight, ExternalLink, Star, ShieldCheck, Receipt } from "lucide-react"
import { StatsCard } from "./StatsCard"
import { PiggyBank, Megaphone, Calendar as CalendarIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function MyDonationsPage() {
    const [donations, setDonations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState<{ current_page: number; last_page: number; total: number } | null>(null)

    const fetchDonations = async (_page = 1) => {
        setIsLoading(true)
        try {
            const response = await api.getMyDonations()
            setDonations(response.data || [])
            if (response.meta?.pagination) setPagination(response.meta.pagination)
        } catch (error) {
            console.error("Failed to fetch donations", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchDonations(currentPage) }, [currentPage])

    const totalCents = donations.reduce((acc, curr) => acc + (curr.amount_cents || 0), 0)
    const campaignsSupported = new Set(donations.map(d => d.campaign?.public_id || "unknown")).size
    const latestPaidAt = donations
        .map(d => d.paid_at)
        .filter(Boolean)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    const lastDate = latestPaidAt ? new Date(latestPaidAt).toLocaleDateString() : "No donations yet"

    const filtered = donations.filter(d => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (d.campaign?.title || "").toLowerCase().includes(q)
            || (d.public_id || "").toLowerCase().includes(q)
            || (d.confirmation_id || "").toLowerCase().includes(q)
            || (d.donor_name || "").toLowerCase().includes(q)
    })

    const handleDownload = (donation: any) => {
        if (donation.receipt_url) {
            window.open(donation.receipt_url, "_blank", "noopener,noreferrer")
        } else {
            // Fallback: generate a simple text receipt
            const lines = [
                "========================================",
                "         DONATION RECEIPT",
                "========================================",
                `Date:          ${donation.paid_at ? new Date(donation.paid_at).toLocaleString() : "Processing"}`,
                `Reference:     ${donation.public_id || "—"}`,
                `Confirmation:  ${donation.confirmation_id || "—"}`,
                `Campaign:      ${donation.campaign?.title || "General Fund"}`,
                `Amount:        ${((donation.amount_cents || 0) / 100).toFixed(2)} ${(donation.currency || "USD").toUpperCase()}`,
                `Status:        ${donation.status || "—"}`,
                `XP Earned:     ${donation.xp_earned || 0} pts`,
                "========================================",
                "Thank you for your generous contribution!",
                "========================================",
            ]
            const blob = new Blob([lines.join("\n")], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `receipt-${donation.public_id?.substring(0, 8) || "donation"}.txt`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const statusStyle = (status: string) => {
        switch (status) {
            case "succeeded": return "bg-green-50 text-green-700 border border-green-200"
            case "pending": return "bg-yellow-50 text-yellow-700 border border-yellow-200"
            case "failed": return "bg-red-50 text-red-700 border border-red-200"
            default: return "bg-gray-50 text-gray-600 border border-gray-200"
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Donation History</h1>
                <p className="text-gray-500">Review your philanthropic impact and download receipts.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Donated"
                    value={`$${(totalCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext="All time"
                    icon={PiggyBank}
                    bgIconColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Campaigns Supported"
                    value={String(campaignsSupported)}
                    subtext="Active contributor"
                    icon={Megaphone}
                    bgIconColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    title="Last Donation"
                    value={lastDate}
                    subtext="Most recent"
                    icon={CalendarIcon}
                    bgIconColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by campaign, reference ID, or confirmation ID…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-9 h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all rounded-xl"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative min-h-[300px]">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin" />
                            <span className="text-sm">Loading donations…</span>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/60 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">XP Earned</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((donation) => (
                                <tr key={donation.public_id} className="hover:bg-gray-50/60 transition-colors group">
                                    {/* Date */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {donation.paid_at ? new Date(donation.paid_at).toLocaleDateString() : "Processing"}
                                        </p>
                                        {donation.paid_at && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(donation.paid_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        )}
                                    </td>

                                    {/* Campaign + IDs */}
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-gray-900 max-w-[200px] truncate">
                                            {donation.campaign?.title || "General Fund"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                Ref: {donation.public_id?.substring(0, 10) || "—"}
                                            </span>
                                            {donation.is_anonymous && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                    <ShieldCheck className="w-2.5 h-2.5" /> Anonymous
                                                </span>
                                            )}
                                        </div>
                                        {donation.confirmation_id && (
                                            <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[180px]">
                                                Conf: {donation.confirmation_id.substring(0, 20)}…
                                            </p>
                                        )}
                                    </td>

                                    {/* Amount */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <p className="text-sm font-bold text-gray-900">
                                            ${((donation.amount_cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">
                                            {donation.currency || "USD"}
                                        </p>
                                    </td>

                                    {/* XP */}
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        {donation.xp_earned ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                <Star className="w-3 h-3" />
                                                +{donation.xp_earned} XP
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyle(donation.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${donation.status === "succeeded" ? "bg-green-500" : donation.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} />
                                            {donation.status || "processing"}
                                        </span>
                                    </td>

                                    {/* Download */}
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => handleDownload(donation)}
                                            title={donation.receipt_url ? "Open Stripe receipt" : "Download text receipt"}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 hover:border-blue-200"
                                        >
                                            {donation.receipt_url ? (
                                                <><ExternalLink className="w-3.5 h-3.5" /> View Receipt</>
                                            ) : (
                                                <><Receipt className="w-3.5 h-3.5" /> Download</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {!isLoading && filtered.length === 0 && (
                        <div className="py-16 text-center text-gray-400">
                            <PiggyBank className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            <p className="font-semibold text-gray-500 mb-1">No donations found</p>
                            <p className="text-sm">{searchQuery ? "Try adjusting your search." : "Time to make an impact!"}</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-semibold text-gray-900">{filtered.length > 0 ? 1 : 0}</span> to{" "}
                        <span className="font-semibold text-gray-900">{filtered.length}</span> of{" "}
                        <span className="font-semibold text-gray-900">{pagination?.total ?? donations.length}</span> results
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={!pagination || currentPage <= 1}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={!pagination || currentPage >= pagination.last_page}
                            className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

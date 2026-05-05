import { useState, useEffect } from "react"
import { api } from "../../lib/api"
import {
    DollarSign,
    Shirt,
    Search,
    Calendar,
    User,
    TrendingUp,
    Package,
    CheckCircle2,
    Clock,
    Loader2,
    ArrowUpRight,
    Gift,
    RefreshCw,
} from "lucide-react"

type DonationType = "all" | "money" | "clothes"

interface MoneyDonation {
    kind: "money"
    id: string
    donor_name: string
    amount_cents: number
    campaign?: string
    date: string
    status: string
}

interface ClothesDonation {
    kind: "clothes"
    id: string
    title: string
    ai_category?: string
    condition?: string
    donor?: { name: string }
    images?: { url: string }[]
    request_status: string
    created_at: string
}

type DonationEntry = MoneyDonation | ClothesDonation

export function OrgReceivedDonationsPage() {
    const [orgId, setOrgId] = useState("")
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<DonationType>("all")
    const [search, setSearch] = useState("")

    const [moneyDonations, setMoneyDonations] = useState<MoneyDonation[]>([])
    const [clothesDonations, setClothesDonations] = useState<ClothesDonation[]>([])

    // Summary stats
    const [totalMoneyAmount, setTotalMoneyAmount] = useState(0)
    const [totalClothesCount, setTotalClothesCount] = useState(0)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            try {
                const u = JSON.parse(userData)
                if (u.org_public_id) {
                    setOrgId(u.org_public_id)
                    loadData(u.org_public_id)
                }
            } catch { }
        }
    }, [])

    const loadData = async (oid: string) => {
        setLoading(true)
        try {
            const [donorsRes, storageRes] = await Promise.all([
                api.getOrgDonors(oid).catch(() => null),
                api.getOrgStorage(oid).catch(() => null),
            ])

            // Build money donations list from donors recent list
            const donors = donorsRes?.data
            if (donors) {
                setTotalMoneyAmount((donors.total_amount_cents || 0) / 100)
                const recent: MoneyDonation[] = (donors.recent_donors || []).map((d: any, i: number) => ({
                    kind: "money",
                    id: `TRX-${1000 + i}`,
                    donor_name: d.donor_name || "Anonymous",
                    amount_cents: d.total_cents || 0,
                    campaign: d.campaign || "General Fund",
                    date: d.last_donated_at || "",
                    status: "completed",
                }))
                setMoneyDonations(recent)
            }

            // Build clothes donations list from storage (all statuses)
            const storageItems: any[] = storageRes?.data || []
            setTotalClothesCount(storageItems.length)
            const clothes: ClothesDonation[] = storageItems.map((item: any) => ({
                kind: "clothes",
                id: item.public_id || item.id,
                title: item.title || "Clothing Item",
                ai_category: item.ai_category,
                condition: item.condition,
                donor: item.donor,
                images: item.images,
                request_status: item.request_status || "accepted",
                created_at: item.created_at || "",
            }))
            setClothesDonations(clothes)
        } catch (e) {
            console.error("Failed to load received donations", e)
        } finally {
            setLoading(false)
        }
    }

    const allEntries: DonationEntry[] = [
        ...moneyDonations,
        ...clothesDonations,
    ].sort((a, b) => {
        const dateA = a.kind === "money" ? a.date : a.created_at
        const dateB = b.kind === "money" ? b.date : b.created_at
        return new Date(dateB).getTime() - new Date(dateA).getTime()
    })

    const filtered = allEntries.filter(entry => {
        if (filter === "money" && entry.kind !== "money") return false
        if (filter === "clothes" && entry.kind !== "clothes") return false
        if (search) {
            const q = search.toLowerCase()
            if (entry.kind === "money") {
                return entry.donor_name.toLowerCase().includes(q) || (entry.campaign || "").toLowerCase().includes(q)
            } else {
                return entry.title.toLowerCase().includes(q) || (entry.ai_category || "").toLowerCase().includes(q) || (entry.donor?.name || "").toLowerCase().includes(q)
            }
        }
        return true
    })

    const conditionBadge = (c?: string) => {
        switch (c) {
            case "new": return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case "like_new": return "bg-blue-50 text-blue-700 border-blue-200"
            case "good": return "bg-sky-50 text-sky-700 border-sky-200"
            case "fair": return "bg-amber-50 text-amber-700 border-amber-200"
            case "poor": return "bg-red-50 text-red-700 border-red-200"
            default: return "bg-gray-50 text-gray-600 border-gray-200"
        }
    }

    const clothesStatusBadge = (status: string) => {
        switch (status) {
            case "delivered": return { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Delivered", icon: CheckCircle2 }
            case "accepted": return { color: "bg-green-50 text-green-700 border-green-200", label: "In Storage", icon: Package }
            default: return { color: "bg-gray-50 text-gray-600 border-gray-200", label: status, icon: Clock }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-sm font-medium">Loading received donations…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Received Donations</h1>
                    <p className="text-gray-500 text-sm">All monetary and clothes donations your organization has received.</p>
                </div>
                <button
                    onClick={() => orgId && loadData(orgId)}
                    className="flex items-center gap-2 h-9 px-4 text-sm font-medium border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors bg-white"
                >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                    Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Gift className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Entries</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{allEntries.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Combined donations received</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Money Received</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        ${totalMoneyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        {moneyDonations.length} financial donations
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Shirt className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clothes Received</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{totalClothesCount}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {clothesDonations.filter(c => c.request_status === "delivered").length} delivered · {clothesDonations.filter(c => c.request_status === "accepted").length} in storage
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Type filter tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                    {([
                        { value: "all", label: "All", count: allEntries.length },
                        { value: "money", label: "Money", count: moneyDonations.length },
                        { value: "clothes", label: "Clothes", count: clothesDonations.length },
                    ] as { value: DonationType; label: string; count: number }[]).map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setFilter(tab.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${filter === tab.value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === tab.value ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by donor, campaign, or item name…"
                        className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all"
                    />
                </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">No donations found</h3>
                    <p className="text-sm text-gray-500">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
                        </span>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {filtered.map((entry, idx) => {
                            if (entry.kind === "money") {
                                return (
                                    <div key={`money-${idx}`} className="px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-center gap-4">
                                        {/* Icon */}
                                        <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>

                                        {/* Donor */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{entry.donor_name}</p>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide flex-shrink-0">
                                                    Money
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {entry.donor_name}
                                                </span>
                                                {entry.campaign && (
                                                    <span className="flex items-center gap-1">
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        {entry.campaign}
                                                    </span>
                                                )}
                                                {entry.date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(entry.date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-lg font-bold text-gray-900">
                                                ${(entry.amount_cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            <span className="text-[10px] font-bold text-green-600 flex items-center justify-end gap-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                )
                            } else {
                                // clothes
                                const statusInfo = clothesStatusBadge(entry.request_status)
                                const StatusIcon = statusInfo.icon
                                return (
                                    <div key={`clothes-${idx}`} className="px-6 py-4 hover:bg-gray-50/60 transition-colors flex items-center gap-4">
                                        {/* Image or icon */}
                                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-purple-50 border border-purple-100 flex-shrink-0">
                                            {entry.images?.[0]?.url ? (
                                                <img src={entry.images[0].url} alt={entry.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Shirt className="w-5 h-5 text-purple-500" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{entry.title}</p>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wide flex-shrink-0">
                                                    Clothes
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                {entry.ai_category && (
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">{entry.ai_category}</span>
                                                )}
                                                {entry.condition && (
                                                    <span className={`px-2 py-0.5 rounded-full border font-medium capitalize ${conditionBadge(entry.condition)}`}>
                                                        {entry.condition.replace("_", " ")}
                                                    </span>
                                                )}
                                                {entry.donor?.name && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {entry.donor.name}
                                                    </span>
                                                )}
                                                {entry.created_at && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(entry.created_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex-shrink-0">
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${statusInfo.color}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

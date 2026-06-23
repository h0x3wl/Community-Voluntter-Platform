import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Header } from "../Header"
import { Footer } from "../Footer"
import { Search, Filter, X, Clock, AlertTriangle, DollarSign, ChevronDown } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState, useMemo, useCallback } from "react"
import { api } from "../../lib/api"

type DeadlineFilter = "all" | "day" | "week" | "month"

interface Filters {
    deadline: DeadlineFilter
    urgentOnly: boolean
    maxGoal: number
}

const DEADLINE_OPTIONS: { value: DeadlineFilter; label: string; icon: string }[] = [
    { value: "all", label: "Any Time", icon: "🌐" },
    { value: "day", label: "Ending in 24h", icon: "⚡" },
    { value: "week", label: "Ending This Week", icon: "📅" },
    { value: "month", label: "Ending This Month", icon: "🗓️" },
]

export function AllCampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<Filters>({
        deadline: "all",
        urgentOnly: false,
        maxGoal: 100000,
    })

    // Track the max goal from all campaigns so the slider range is dynamic
    const globalMaxGoal = useMemo(() => {
        if (campaigns.length === 0) return 100000
        const max = Math.max(...campaigns.map(c => (c.goal_cents || 0) / 100))
        // Round up to nearest 1000 for a clean slider max
        return Math.ceil(max / 1000) * 1000 || 100000
    }, [campaigns])

    // Reset maxGoal slider ceiling when campaigns load
    useEffect(() => {
        setFilters(prev => ({ ...prev, maxGoal: globalMaxGoal }))
    }, [globalMaxGoal])

    const fetchAll = async () => {
        try {
            const res = await api.getCampaigns()
            const data = res.data || []
            data.sort((a: any, b: any) => {
                if (a.is_urgent && !b.is_urgent) return -1
                if (!a.is_urgent && b.is_urgent) return 1
                return 0
            })
            setCampaigns(data)
        } catch (err) {
            console.error("Failed to fetch campaigns", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAll()

        // Refetch when the user navigates back to this tab/page (e.g. after donating)
        const onFocus = () => fetchAll()
        const onVisibility = () => {
            if (document.visibilityState === 'visible') fetchAll()
        }
        window.addEventListener("focus", onFocus)
        document.addEventListener("visibilitychange", onVisibility)
        return () => {
            window.removeEventListener("focus", onFocus)
            document.removeEventListener("visibilitychange", onVisibility)
        }
    }, [])

    // ── Filtering logic ──────────────────────────────────────────────
    const getDaysLeft = useCallback((campaign: any): number => {
        // Use the backend-computed days_left field if available
        if (typeof campaign.days_left === "number") return campaign.days_left

        // Fallback: compute from ends_at
        const endStr = campaign.ends_at
        if (!endStr) return Infinity
        const end = new Date(endStr)
        const now = new Date()
        const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return Math.max(0, Math.ceil(diff))
    }, [])

    const filteredCampaigns = useMemo(() => {
        let result = [...campaigns]

        // 1. Text search — match across title, description, category, org name
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            result = result.filter(c => {
                const title = (c.title || "").toLowerCase()
                const desc = (c.description || "").toLowerCase()
                const cat = (c.category?.name || "").toLowerCase()
                const org = (c.organization?.name || "").toLowerCase()
                return title.includes(q) || desc.includes(q) || cat.includes(q) || org.includes(q)
            })
        }

        // 2. Deadline filter
        if (filters.deadline !== "all") {
            const maxDays = filters.deadline === "day" ? 1 : filters.deadline === "week" ? 7 : 30
            result = result.filter(c => getDaysLeft(c) <= maxDays)
        }

        // 3. Urgent only
        if (filters.urgentOnly) {
            result = result.filter(c => c.is_urgent)
        }

        // 4. Goal amount ceiling
        result = result.filter(c => {
            const goal = (c.goal_cents || 0) / 100
            return goal <= filters.maxGoal
        })

        return result
    }, [campaigns, searchQuery, filters, getDaysLeft])

    const activeFilterCount = useMemo(() => {
        let count = 0
        if (filters.deadline !== "all") count++
        if (filters.urgentOnly) count++
        if (filters.maxGoal < globalMaxGoal) count++
        return count
    }, [filters, globalMaxGoal])

    const clearFilters = () => {
        setFilters({ deadline: "all", urgentOnly: false, maxGoal: globalMaxGoal })
        setSearchQuery("")
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Page Header */}
                <div className="bg-white border-b border-gray-100 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Campaigns</h1>
                        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search causes, locations, or keywords..."
                                    className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                className={`h-11 border-gray-200 px-6 relative transition-colors ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
                                onClick={() => setShowFilters(prev => !prev)}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-blue-600 text-white rounded-full">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </Button>
                        </div>

                        {/* ── Filter Panel ─────────────────────────────────── */}
                        <div
                            className="overflow-hidden transition-all duration-300 ease-in-out"
                            style={{
                                maxHeight: showFilters ? "500px" : "0px",
                                opacity: showFilters ? 1 : 0,
                                marginTop: showFilters ? "16px" : "0px",
                            }}
                        >
                            <div className="max-w-4xl bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-6">
                                {/* Row 1: Deadline + Urgent */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Deadline */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                            <Clock className="w-3.5 h-3.5" /> Ending Within
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {DEADLINE_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setFilters(p => ({ ...p, deadline: opt.value }))}
                                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                                                        filters.deadline === opt.value
                                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                                    }`}
                                                >
                                                    <span className="text-base">{opt.icon}</span>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Urgent Toggle */}
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Urgency
                                        </label>
                                        <button
                                            onClick={() => setFilters(p => ({ ...p, urgentOnly: !p.urgentOnly }))}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${
                                                filters.urgentOnly
                                                    ? "bg-red-50 text-red-700 border-red-300 shadow-sm"
                                                    : "bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                Urgent Cases Only
                                            </span>
                                            <div
                                                className={`w-10 h-6 rounded-full transition-colors relative ${
                                                    filters.urgentOnly ? "bg-red-500" : "bg-gray-300"
                                                }`}
                                            >
                                                <div
                                                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                                        filters.urgentOnly ? "translate-x-5" : "translate-x-1"
                                                    }`}
                                                />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Row 2: Goal Amount Slider */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                        <DollarSign className="w-3.5 h-3.5" /> Max Goal Amount
                                    </label>
                                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm text-gray-500 font-medium">$0</span>
                                            <span className="text-lg font-bold text-blue-600">
                                                ${filters.maxGoal.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-500 font-medium">${globalMaxGoal.toLocaleString()}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={globalMaxGoal}
                                            step={Math.max(100, Math.round(globalMaxGoal / 100))}
                                            value={filters.maxGoal}
                                            onChange={e => setFilters(p => ({ ...p, maxGoal: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600
                                                [&::-webkit-slider-thumb]:appearance-none
                                                [&::-webkit-slider-thumb]:w-5
                                                [&::-webkit-slider-thumb]:h-5
                                                [&::-webkit-slider-thumb]:rounded-full
                                                [&::-webkit-slider-thumb]:bg-blue-600
                                                [&::-webkit-slider-thumb]:shadow-lg
                                                [&::-webkit-slider-thumb]:shadow-blue-500/30
                                                [&::-webkit-slider-thumb]:border-2
                                                [&::-webkit-slider-thumb]:border-white
                                                [&::-webkit-slider-thumb]:cursor-pointer
                                                [&::-moz-range-thumb]:w-5
                                                [&::-moz-range-thumb]:h-5
                                                [&::-moz-range-thumb]:rounded-full
                                                [&::-moz-range-thumb]:bg-blue-600
                                                [&::-moz-range-thumb]:border-2
                                                [&::-moz-range-thumb]:border-white
                                                [&::-moz-range-thumb]:cursor-pointer
                                            "
                                            style={{
                                                background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(filters.maxGoal / globalMaxGoal) * 100}%, #e5e7eb ${(filters.maxGoal / globalMaxGoal) * 100}%, #e5e7eb 100%)`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-500">
                                        {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""} found
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            className="text-gray-500 hover:text-gray-900 text-sm font-semibold"
                                            onClick={clearFilters}
                                        >
                                            Clear All
                                        </Button>
                                        <Button
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 shadow-sm"
                                            onClick={() => setShowFilters(false)}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filter Pills */}
                        {activeFilterCount > 0 && !showFilters && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 max-w-4xl">
                                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Active:</span>
                                {filters.deadline !== "all" && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                                        <Clock className="w-3 h-3" />
                                        {DEADLINE_OPTIONS.find(o => o.value === filters.deadline)?.label}
                                        <button onClick={() => setFilters(p => ({ ...p, deadline: "all" }))} className="ml-1 hover:text-blue-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.urgentOnly && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                                        <AlertTriangle className="w-3 h-3" />
                                        Urgent Only
                                        <button onClick={() => setFilters(p => ({ ...p, urgentOnly: false }))} className="ml-1 hover:text-red-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.maxGoal < globalMaxGoal && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                                        <DollarSign className="w-3 h-3" />
                                        Up to ${filters.maxGoal.toLocaleString()}
                                        <button onClick={() => setFilters(p => ({ ...p, maxGoal: globalMaxGoal }))} className="ml-1 hover:text-green-900">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                )}
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-gray-400 hover:text-gray-600 font-semibold underline underline-offset-2 ml-2 transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="container mx-auto px-4 py-12 relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                            <span className="text-gray-500 font-medium">Loading campaigns...</span>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCampaigns.map((campaign, i) => {
                            const raised = (campaign.raised_cents || 0) / 100
                            const goal = (campaign.goal_cents || 0) / 100
                            const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
                            
                            return (
                                <div key={campaign.public_id || i} className={`bg-white rounded-2xl border ${campaign.is_urgent ? 'border-red-500 shadow-red-500/10' : 'border-gray-100'} shadow-sm overflow-hidden hover:shadow-lg transition-shadow group flex flex-col`}>
                                    <Link to={`/campaigns/${campaign.share_slug || campaign.public_id || i}`} className="h-48 relative overflow-hidden block">
                                        <img 
                                            src={campaign.images?.[0]?.url || `https://picsum.photos/seed/${campaign.public_id || i}/400/300`} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt={campaign.title} 
                                        />
                                        {campaign.is_urgent && (
                                            <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm flex items-center gap-1">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                Urgent
                                            </span>
                                        )}
                                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm">
                                            {campaign.category?.name || "Community"}
                                        </span>
                                    </Link>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <Link to={`/campaigns/${campaign.share_slug || campaign.public_id || i}`} className="block mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{campaign.title}</h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {campaign.description || "Help us reach our goal to provide sustainable resources to communities in need."}
                                        </p>
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs font-bold mb-2">
                                                <span className="text-gray-900">${raised.toLocaleString()} raised</span>
                                                <span className="text-gray-400">Goal: ${goal.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <Link to="/donate">
                                                <Button className="w-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 font-bold hover:border-gray-300">
                                                    Donate Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Empty state — no results from filtering */}
                    {!isLoading && filteredCampaigns.length === 0 && campaigns.length > 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="text-4xl mb-4">🔍</div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No campaigns match your filters</h3>
                            <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filter criteria</p>
                            <Button
                                variant="outline"
                                className="font-semibold border-gray-200"
                                onClick={clearFilters}
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}

                    {/* Empty state — genuinely no campaigns */}
                    {!isLoading && campaigns.length === 0 && (
                        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
                            No campaigns found.
                        </div>
                    )}

                    {/* Load More */}
                    {!isLoading && filteredCampaigns.length > 0 && (
                        <div className="mt-12 text-center">
                            <Button variant="ghost" className="text-gray-500 hover:text-gray-900 font-semibold bg-gray-50 hover:bg-gray-100 rounded-full px-6">
                                Load More Campaigns
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

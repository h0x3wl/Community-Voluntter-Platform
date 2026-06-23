import { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Search,
    Filter,
    Plus,
    Calendar,
    Users,
    Flag,
    X,
    CheckCircle2,
    Image as ImageIcon,
    Edit2,
    Trash2,
    Clock,
    AlertTriangle,
    DollarSign
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"
import { Link } from "react-router-dom"

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

export function AdminCampaignsPage() {
    const { orgId } = useCurrentUser()
    const [searchQuery, setSearchQuery] = useState("")
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [overview, setOverview] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState<Filters>({
        deadline: "all",
        urgentOnly: false,
        maxGoal: 100000,
    })
    
    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [wizardStatus, setWizardStatus] = useState<"idle" | "submitting" | "success">("idle")
    const [editingCampaign, setEditingCampaign] = useState<any>(null)
    const [campaignImageFile, setCampaignImageFile] = useState<File | null>(null)
    const campaignImageRef = useRef<HTMLInputElement>(null)

    // Track the max goal from all campaigns so the slider range is dynamic
    const globalMaxGoal = useMemo(() => {
        if (campaigns.length === 0) return 100000
        const max = Math.max(...campaigns.map(c => (c.goal_cents || 0) / 100))
        return Math.ceil(max / 1000) * 1000 || 100000
    }, [campaigns])

    // Reset maxGoal slider ceiling when campaigns load
    useEffect(() => {
        setFilters(prev => ({ ...prev, maxGoal: globalMaxGoal }))
    }, [globalMaxGoal])

    const fetchAll = async () => {
        try {
            const [campRes, overRes] = await Promise.all([
                api.getOrgCampaigns(orgId).catch(() => null),
                api.getOrgOverview(orgId).catch(() => null)
            ])
            if (campRes?.data) setCampaigns(campRes.data)
            if (overRes?.data) setOverview(overRes.data)
        } catch (err) {
            console.error("Failed to fetch campaigns page data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!orgId) return
        fetchAll()
    }, [orgId])

    const handleCreateOrEditCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        const formData = new FormData(e.currentTarget)
        const endsAtValue = formData.get("ends_at") as string;
        const campaignData: any = {
            title: formData.get("title") || "New Campaign",
            description: formData.get("description"),
            goal_cents: parseInt((formData.get("goal") as string) || "50000") * 100,
            is_urgent: formData.get("is_urgent") === "on",
        }
        if (endsAtValue) {
            campaignData.ends_at = endsAtValue;
        }

        setWizardStatus("submitting")
        try {
            let createdCampaign: any = null;
            if (editingCampaign) {
                await api.updateOrgCampaign(orgId, editingCampaign.public_id, campaignData);
                createdCampaign = editingCampaign;
            } else {
                const res = await api.createOrgCampaign(orgId, campaignData);
                createdCampaign = res?.data;
            }

            // Upload image if one was selected
            if (campaignImageFile && createdCampaign?.public_id) {
                const imgForm = new FormData();
                imgForm.append('image', campaignImageFile);
                await api.uploadCampaignImage(orgId, createdCampaign.public_id, imgForm).catch(e => console.error('Image upload failed:', e));
            }
            
            // Re-fetch everything to show accurate DB changes
            await fetchAll()
            
            setWizardStatus("success")
            setTimeout(() => {
                setIsWizardOpen(false)
                setWizardStatus("idle")
                setEditingCampaign(null)
                setCampaignImageFile(null)
                if (campaignImageRef.current) campaignImageRef.current.value = '';
            }, 1500)
        } catch (error: any) {
            console.error("Failed to save campaign:", error)
            const validationErrors = error.errors ? "\nDetails: " + JSON.stringify(error.errors) : "";
            alert(`Error: ${error.message}${validationErrors}`)
            setWizardStatus("idle")
        }
    }

    const handleDelete = async (campaignId: string) => {
        if(confirm("Are you sure you want to remove this campaign? This action permanently deletes it.")) {
            try {
                await api.deleteOrgCampaign(orgId, campaignId);
                // Refresh list
                await fetchAll();
            } catch (error) {
                console.error("Failed to delete campaign:", error)
                alert("An error occurred while deleting the campaign.")
            }
        }
    }

    const openWizardForEdit = (campaign: any) => {
        setEditingCampaign(campaign)
        setIsWizardOpen(true)
    }

    const openWizardForCreate = () => {
        setEditingCampaign(null)
        setIsWizardOpen(true)
    }

    const activeCount = overview?.total_active_campaigns || campaigns.filter((c: any) => c.status === 'active').length || 0;
    const fundsRaised = (overview?.funds_raised_month || 0) / 100;
    const activeDonors = overview?.active_donors || 0;

    // ── Filtering logic (same as /campaigns) ───────────────────────
    const getDaysLeft = useCallback((campaign: any): number => {
        if (typeof campaign.days_left === "number") return campaign.days_left
        const endStr = campaign.ends_at
        if (!endStr) return Infinity
        const end = new Date(endStr)
        const now = new Date()
        const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        return Math.max(0, Math.ceil(diff))
    }, [])

    const filteredCampaigns = useMemo(() => {
        let result = [...campaigns]

        // 1. Text search
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase()
            result = result.filter(c => {
                const title = (c.title || "").toLowerCase()
                const desc = (c.description || "").toLowerCase()
                const status = (c.status || "").toLowerCase()
                const pid = (c.public_id || "").toLowerCase()
                return title.includes(q) || desc.includes(q) || status.includes(q) || pid.includes(q)
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
        <div className="space-y-8 relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <span className="text-gray-500 font-medium">Loading manager...</span>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Campaigns Manager</h1>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search campaigns..."
                            className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white transition-all rounded-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                        className={`h-10 border-gray-200 px-4 relative transition-colors ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
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
            </div>

            {/* ── Filter Panel ─────────────────────────────────── */}
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: showFilters ? "500px" : "0px",
                    opacity: showFilters ? 1 : 0,
                    marginTop: showFilters ? "0px" : "-32px",
                }}
            >
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-6">
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
                <div className="flex flex-wrap items-center gap-2">
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

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Active Campaigns</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{activeCount}</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            Live
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Funds Raised (Month)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">${fundsRaised.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            This month
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Donors</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{activeDonors.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            Growing
                        </span>
                    </div>
                </div>
            </div>

            {/* Active Campaigns Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Active Campaigns</h2>
                        <p className="text-sm text-gray-500">Review and manage your current fundraising initiatives</p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        onClick={openWizardForCreate}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Campaign
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredCampaigns.map((camp, i) => {
                        const raised = (camp.raised_cents || 0) / 100
                        const goal = (camp.goal_cents || 1) / 100
                        const progress = Math.min((raised / goal) * 100, 100)
                        
                        // Style map
                        const statusColors: any = {
                            'active': 'bg-green-500 text-white',
                            'pending_review': 'bg-amber-500 text-white',
                            'paused': 'bg-yellow-500 text-white',
                            'completed': 'bg-blue-500 text-white',
                            'rejected': 'bg-red-500 text-white',
                        }
                        const badgeColor = statusColors[camp.status] || 'bg-gray-500 text-white'
                        const barColor = camp.status === 'paused' ? 'bg-yellow-500' : camp.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'
                        
                        return (
                            <div key={camp.public_id || i} className={`bg-white rounded-2xl border ${camp.is_urgent ? 'border-red-300 shadow-red-500/10' : 'border-gray-100'} shadow-sm overflow-hidden flex flex-col group`}>
                                <Link to={`/campaigns/${camp.share_slug || camp.public_id}`} className="h-40 relative overflow-hidden bg-gray-100 flex items-center justify-center block">
                                    <img
                                        src={camp.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(camp.title || 'Campaign')}&background=3b82f6&color=fff&size=400&font-size=0.33&bold=true`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={camp.title}
                                    />
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                        {camp.is_urgent && (
                                            <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm bg-red-600 text-white flex items-center gap-1">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                Urgent
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm ${badgeColor}`}>
                                            {camp.status || "active"}
                                        </span>
                                    </div>
                                </Link>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1 flex-1" title={camp.title}>{camp.title}</h3>
                                        <div className="flex gap-1">
                                            <button 
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                title="Edit"
                                                onClick={() => openWizardForEdit(camp)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                title="Remove"
                                                onClick={() => handleDelete(camp.public_id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                        {camp.description || "A fundraising initiative directed towards our core mission."}
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs font-bold mb-1.5">
                                            <span className="text-gray-900">${raised.toLocaleString()} raised</span>
                                            <span className="text-gray-400">Goal: ${goal.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                                            <div className={`h-full ${barColor}`} style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50 pt-3">
                                            <span className="flex items-center gap-1">
                                                {camp.status === 'active' ? <Calendar className="w-3 h-3" /> : <Flag className="w-3 h-3" />} 
                                                {camp.ends_at
                                                    ? `Ends ${new Date(camp.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                    : camp.days_left
                                                        ? `${camp.days_left} days left`
                                                        : camp.status
                                                }
                                            </span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {camp.donors_count || 0} donors</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* New Campaign Placeholder */}
                    <div
                        className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 hover:bg-gray-100 transition-colors cursor-pointer group h-full min-h-[300px]"
                        onClick={openWizardForCreate}
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-gray-900">New Campaign</h3>
                        <p className="text-xs text-gray-500 text-center mt-2 max-w-[150px]">
                            Launch a new fundraising initiative
                        </p>
                    </div>

                </div>

                {/* Empty state from filtering */}
                {!isLoading && filteredCampaigns.length === 0 && campaigns.length > 0 && (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100 mt-6">
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
            </div>

            {/* Create / Edit Campaign Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
                        {wizardStatus === "success" ? (
                            <div className="p-16 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {editingCampaign ? "Campaign Updated!" : "Campaign Submitted!"}
                                </h2>
                                <p className="text-gray-500 mt-3 max-w-sm">
                                    {editingCampaign 
                                        ? "Your changes have been saved successfully."
                                        : "Your campaign has been submitted for review. The platform admin will approve it shortly."
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
                                    </h2>
                                    <button onClick={() => setIsWizardOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateOrEditCampaign} className="p-6 space-y-6">
                                    {/* Cover Image Upload */}
                                    <input
                                        type="file"
                                        ref={campaignImageRef}
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={(e) => setCampaignImageFile(e.target.files?.[0] || null)}
                                    />
                                    <div
                                        className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden"
                                        onClick={() => campaignImageRef.current?.click()}
                                    >
                                        {campaignImageFile ? (
                                            <div className="flex flex-col items-center">
                                                <img src={URL.createObjectURL(campaignImageFile)} alt="Preview" className="w-full h-32 object-cover rounded-lg opacity-90" />
                                                <span className="text-xs text-green-600 font-semibold mt-1">{campaignImageFile.name}</span>
                                            </div>
                                        ) : editingCampaign?.images?.[0]?.url ? (
                                            <img src={editingCampaign.images[0].url} alt="Cover" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-sm font-medium">Upload Cover Image</span>
                                                <span className="text-xs opacity-75 mt-1">Recommended: 1200x630px JPG/PNG</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Campaign Title</label>
                                        <Input name="title" required defaultValue={editingCampaign?.title || ""} placeholder="e.g. Clean Water Initiative 2026" className="text-lg font-medium" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Brief Description</label>
                                        <textarea 
                                            name="description"
                                            required 
                                            defaultValue={editingCampaign?.description || ""}
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="What is the goal of this initiative? How will the funds be used?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Financial Goal ($)</label>
                                            <Input name="goal" required min="100" defaultValue={editingCampaign ? editingCampaign.goal_cents / 100 : ""} type="number" placeholder="50000" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Target End Date</label>
                                            <Input name="ends_at" required type="date" min={new Date().toISOString().split('T')[0]} defaultValue={editingCampaign?.ends_at || ""} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            name="is_urgent" 
                                            id="is_urgent" 
                                            defaultChecked={editingCampaign?.is_urgent}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="is_urgent" className="text-sm font-semibold text-gray-900 cursor-pointer">
                                            Mark as Urgent Request
                                        </label>
                                        <span className="text-xs text-gray-500 ml-1">(Highlight this campaign for immediate priority)</span>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                        <Button type="button" variant="ghost" onClick={() => setIsWizardOpen(false)}>Cancel</Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md font-bold" disabled={wizardStatus === "submitting"}>
                                        {wizardStatus === "submitting" ? "Saving..." : editingCampaign ? "Save Changes" : "Submit for Review"}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

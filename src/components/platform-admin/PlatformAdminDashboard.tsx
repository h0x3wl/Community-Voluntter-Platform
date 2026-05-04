import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import {
    Megaphone,
    Building2,
    Users,
    Activity,
    ArrowRight,
    TrendingUp
} from "lucide-react"
import { Link } from "react-router-dom"

export function PlatformAdminDashboard() {
    const [stats, setStats] = useState({
        totalCampaigns: 0,
        totalOrgs: 0,
        totalUsers: 0,
        pendingReview: 0,
    })
    const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [campRes, orgRes, userRes, pendingRes] = await Promise.all([
                    api.getAdminCampaigns().catch(() => null),
                    api.getAdminOrganizations().catch(() => null),
                    api.getAdminUsers().catch(() => null),
                    api.getAdminCampaigns('status=pending_review').catch(() => null),
                ])

                setStats({
                    totalCampaigns: campRes?.meta?.pagination?.total || campRes?.data?.length || 0,
                    totalOrgs: orgRes?.meta?.pagination?.total || orgRes?.data?.length || 0,
                    totalUsers: userRes?.meta?.pagination?.total || userRes?.data?.length || 0,
                    pendingReview: pendingRes?.meta?.pagination?.total || pendingRes?.data?.length || 0,
                })

                if (campRes?.data) {
                    setRecentCampaigns(campRes.data.slice(0, 5))
                }
            } catch (err) {
                console.error("Failed to load admin dashboard", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="text-gray-500 font-medium">Loading platform data...</span>
            </div>
        )
    }

    const statCards = [
        { icon: Megaphone, label: "Total Campaigns", value: stats.totalCampaigns, color: "indigo", href: "/admin/campaigns" },
        { icon: Building2, label: "Organizations", value: stats.totalOrgs, color: "emerald", href: "/admin/organizations" },
        { icon: Users, label: "Registered Users", value: stats.totalUsers, color: "violet", href: "/admin/users" },
        { icon: Activity, label: "Pending Review", value: stats.pendingReview, color: "amber", href: "/admin/campaigns" },
    ]

    const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
        indigo: { bg: "bg-indigo-50", text: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
        violet: { bg: "bg-violet-50", text: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
        amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
                    <p className="text-gray-500 mt-1">Global platform statistics and management console.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => {
                    const colors = colorMap[card.color]
                    return (
                        <Link
                            key={card.label}
                            to={card.href}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center ${colors.text}`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <div className={`${colors.badge} px-2 py-1 rounded-lg flex items-center text-xs font-bold gap-1`}>
                                    <TrendingUp className="w-3 h-3" />
                                    View
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</h3>
                        </Link>
                    )
                })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Campaigns */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Recent Campaigns</h3>
                        <Link to="/admin/campaigns" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentCampaigns.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">No campaigns found.</div>
                        ) : (
                            recentCampaigns.map((camp: any, i: number) => {
                                const statusColors: Record<string, string> = {
                                    active: "bg-green-100 text-green-700",
                                    pending_review: "bg-amber-100 text-amber-700",
                                    paused: "bg-gray-100 text-gray-600",
                                    rejected: "bg-red-100 text-red-700",
                                    completed: "bg-blue-100 text-blue-700",
                                }
                                return (
                                    <div key={camp.public_id || i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {camp.title?.charAt(0) || "C"}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">{camp.title}</h4>
                                                <p className="text-xs text-gray-500">{camp.organization?.name || "—"}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${statusColors[camp.status] || statusColors.active}`}>
                                            {camp.status?.replace("_", " ") || "active"}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link to="/admin/campaigns" className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <Megaphone className="w-5 h-5 text-indigo-500" />
                                    Review Campaigns
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </Link>
                            <Link to="/admin/organizations" className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <Building2 className="w-5 h-5 text-emerald-500" />
                                    Manage Organizations
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </Link>
                            <Link to="/admin/users" className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 group">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-violet-500" />
                                    View All Users
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-indigo-200 uppercase">System Healthy</span>
                            </div>
                            <h3 className="text-xl font-bold mb-1">All Systems Go</h3>
                            <p className="text-sm text-indigo-200">All services are operational. Database synced and responsive.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { Button } from "../ui/button"
import { Link, useOutletContext } from "react-router-dom"
import { HandHeart, PiggyBank, CalendarClock, Users } from "lucide-react"
import { StatsCard } from "./StatsCard"
import { RecentActivity } from "./RecentActivity"
import { SuggestedCampaign } from "./SuggestedCampaign"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function DashboardPage() {
    const { user } = useOutletContext<{ user: any }>()
    const [impact, setImpact] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    const [suggestedCampaign, setSuggestedCampaign] = useState<any>(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM
            try {
                const [impactRes, campaignsRes] = await Promise.all([
                    api.getImpactTracker(currentMonth).catch(() => null),
                    api.getCampaigns().catch(() => null)
                ])
                
                if (impactRes?.data) setImpact(impactRes.data)
                
                if (campaignsRes?.data) {
                    const active = campaignsRes.data.filter((c: any) => c.status === 'active')
                    if (active.length > 0) {
                        // Pick a random active campaign to suggest
                        setSuggestedCampaign(active[Math.floor(Math.random() * active.length)])
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.first_name}!</h1>
                    <p className="text-gray-500">Thank you for making a difference today. Your support changes lives.</p>
                </div>
                <Link to="/campaigns">
                    <Button className="shadow-lg shadow-blue-500/20">
                        <HandHeart className="w-4 h-4 mr-2" />
                        Make a Donation
                    </Button>
                </Link>
            </div>

            {/* Gamification Level Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <span className="text-2xl font-extrabold">{user?.level || 1}</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Level {user?.level || 1}</p>
                            <p className="font-bold text-lg">
                                {(user?.level || 1) <= 1 ? 'Newcomer' : (user?.level || 1) <= 3 ? 'Contributor' : (user?.level || 1) <= 5 ? 'Philanthropist' : (user?.level || 1) <= 8 ? 'Champion' : 'Legend'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <p className="text-2xl font-extrabold">{(user?.xp || 0).toLocaleString()}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase">XP Earned</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-extrabold">${((user?.total_donated_cents || 0) / 100).toLocaleString()}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase">Total Donated</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-extrabold">{(user?.donation_count || 0)}</p>
                            <p className="text-white/60 text-[10px] font-bold uppercase">Donations</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex justify-between text-xs font-medium text-white/60 mb-1">
                        <span>{user?.xp || 0} XP</span>
                        <span>Next Level</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/80 rounded-full transition-all duration-1000" style={{ width: `${Math.min(((user?.xp || 0) % 100), 100)}%` }} />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Donations"
                    value={isLoading ? "..." : `$${(impact?.monthly_goal_progress?.current_cents / 100 || 0).toLocaleString()}`}
                    subtext="donated this month"
                    icon={PiggyBank}
                    bgIconColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <StatsCard
                    title="Lives Impacted"
                    value={isLoading ? "..." : String(impact?.lives_impacted || 0)}
                    subtext="People directly helped"
                    icon={Users}
                    bgIconColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    title="Volunteer Hours"
                    value={isLoading ? "..." : `${impact?.volunteer_hours || 0} hrs`}
                    subtext="Time dedicated this month"
                    icon={CalendarClock}
                    bgIconColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <RecentActivity />
                </div>
                <div className="lg:col-span-1">
                    <h3 className="font-bold text-gray-900 mb-6">Suggested for You</h3>
                    {suggestedCampaign ? (
                        <SuggestedCampaign campaign={suggestedCampaign} />
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center h-48 text-gray-400 text-sm">
                            No active campaigns available
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

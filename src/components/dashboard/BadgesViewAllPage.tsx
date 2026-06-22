import { useEffect, useState } from "react"
import { useOutletContext, Link } from "react-router-dom"
import { Trophy, ArrowLeft } from "lucide-react"
import { api } from "../../lib/api"
import { cn } from "../../lib/utils"

function getBadgeProgress(badge: any, user: any): { current: number; target: number; percent: number; label: string } {
    const totalDonatedCents = user?.total_donated_cents || 0
    const donationCount = user?.donation_count || 0
    const campaignsSupported = user?.campaigns_supported_count || 0

    switch (badge.criteria_type) {
        case 'donation_total': {
            const targetDollars = (badge.criteria_value || 0) / 100
            const currentDollars = totalDonatedCents / 100
            return {
                current: currentDollars,
                target: targetDollars,
                percent: targetDollars > 0 ? Math.min((currentDollars / targetDollars) * 100, 100) : 0,
                label: `$${currentDollars.toLocaleString()} / $${targetDollars.toLocaleString()} donated`,
            }
        }
        case 'donation_count':
            return {
                current: donationCount,
                target: badge.criteria_value || 0,
                percent: badge.criteria_value > 0 ? Math.min((donationCount / badge.criteria_value) * 100, 100) : 0,
                label: `${donationCount} / ${badge.criteria_value} donations`,
            }
        case 'campaign_count':
            return {
                current: campaignsSupported,
                target: badge.criteria_value || 0,
                percent: badge.criteria_value > 0 ? Math.min((campaignsSupported / badge.criteria_value) * 100, 100) : 0,
                label: `${campaignsSupported} / ${badge.criteria_value} campaigns`,
            }
        default:
            return { current: 0, target: 0, percent: 0, label: "" }
    }
}

function getCriteriaTypeLabel(type: string): string {
    switch (type) {
        case 'donation_total': return '💰 Total Donated'
        case 'donation_count': return '🔢 Donation Count'
        case 'campaign_count': return '📋 Campaigns'
        default: return '🏆 Achievement'
    }
}

export function BadgesViewAllPage() {
    const { user } = useOutletContext<{ user: any }>()
    const [systemBadges, setSystemBadges] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const res = await api.getBadges()
                if (res.data) {
                    setSystemBadges(res.data)
                }
            } catch (err) {
                console.error("Failed to fetch badges", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBadges()
    }, [])

    const earnedBadgesCount = user?.badges?.length || 0;

    // Group badges by criteria_type
    const groupedBadges: Record<string, any[]> = {}
    systemBadges.forEach(badge => {
        const type = badge.criteria_type || 'other'
        if (!groupedBadges[type]) groupedBadges[type] = []
        groupedBadges[type].push(badge)
    })

    const groupOrder = ['donation_count', 'donation_total', 'campaign_count']
    const sortedGroups = groupOrder.filter(g => groupedBadges[g]).map(g => ({ type: g, badges: groupedBadges[g] }))
    // Add any remaining groups not in the predefined order
    Object.keys(groupedBadges).forEach(type => {
        if (!groupOrder.includes(type)) {
            sortedGroups.push({ type, badges: groupedBadges[type] })
        }
    })
    
    return (
        <div className="space-y-8 pb-20">
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <Link to="/user/impact" className="hover:text-gray-900 flex items-center">
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Impact Tracker
                    </Link>
                    /
                    <span className="text-gray-900 font-medium">Badges</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Trophy className="w-8 h-8 text-orange-500" />
                            Your Achievements
                        </h1>
                        <p className="text-gray-500">
                            You've earned {earnedBadgesCount} out of {systemBadges.length} badges. Keep participating to unlock more!
                        </p>
                    </div>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 p-5 text-center">
                    <span className="text-3xl font-extrabold text-orange-600">{earnedBadgesCount}</span>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Earned</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-5 text-center">
                    <span className="text-3xl font-extrabold text-gray-400">{systemBadges.length - earnedBadgesCount}</span>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Locked</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-5 text-center">
                    <span className="text-3xl font-extrabold text-blue-600">{user?.donation_count || 0}</span>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Donations</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 p-5 text-center">
                    <span className="text-3xl font-extrabold text-green-600">${((user?.total_donated_cents || 0) / 100).toLocaleString()}</span>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Donated</p>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading badges...</div>
            ) : (
                <div className="space-y-10">
                    {sortedGroups.map(({ type, badges }) => (
                        <div key={type}>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>{getCriteriaTypeLabel(type)}</span>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                {badges.map((badge: any) => {
                                    const earnedBadgeInfo = user?.badges?.find((ub: any) => ub.id === badge.id || ub.code === badge.code);
                                    const isEarned = !!earnedBadgeInfo;
                                    const progress = getBadgeProgress(badge, user);

                                    return (
                                        <div 
                                            key={badge.id || badge.code} 
                                            className={cn(
                                                "flex flex-col items-center justify-start p-6 border rounded-2xl transition-all h-full text-center group relative overflow-hidden",
                                                isEarned 
                                                    ? "border-orange-100 bg-gradient-to-br from-white to-orange-50/50 shadow-sm hover:shadow-md hover:border-orange-200"
                                                    : "border-gray-200 bg-gray-50/80"
                                            )}
                                        >
                                            <div className={cn(
                                                "transition-all",
                                                !isEarned && "blur-[3px] grayscale opacity-60"
                                            )}>
                                                <div className={cn(
                                                    "w-16 h-16 rounded-full overflow-hidden shadow-sm p-1.5 mb-4 border mx-auto",
                                                    isEarned ? "bg-white border-orange-100" : "bg-gray-100 border-gray-200"
                                                )}>
                                                    <img 
                                                        src={badge.icon_url || `https://ui-avatars.com/api/?name=${badge.name}&background=ffedd5&color=ea580c`} 
                                                        alt={badge.name} 
                                                        className="w-full h-full object-cover rounded-full" 
                                                    />
                                                </div>
                                                <h3 className={cn(
                                                    "font-bold text-sm mb-1 leading-tight",
                                                    isEarned ? "text-gray-900" : "text-gray-600"
                                                )}>{badge.name}</h3>
                                            </div>
                                            
                                            <p className="text-[11px] text-gray-500 leading-relaxed mb-3 flex-1">
                                                {badge.description || "Contribute more to unlock this badge."}
                                            </p>

                                            {/* Progress bar */}
                                            {!isEarned && progress.target > 0 && (
                                                <div className="w-full mb-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                                            style={{ width: `${progress.percent}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">{progress.label}</p>
                                                </div>
                                            )}

                                            {isEarned ? (
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                                        ✓ Earned
                                                    </span>
                                                    {earnedBadgeInfo?.awarded_at && (
                                                        <p className="text-[9px] text-gray-400">
                                                            {new Date(earnedBadgeInfo.awarded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                                    🔒 Locked
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

import { useEffect, useState } from "react"
import { useOutletContext, Link } from "react-router-dom"
import { Trophy, ArrowLeft } from "lucide-react"
import { api } from "../../lib/api"
import { cn } from "../../lib/utils"

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

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Loading badges...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {systemBadges.map((badge) => {
                        const earnedBadgeInfo = user?.badges?.find((ub: any) => ub.id === badge.id || ub.code === badge.code);
                        const isEarned = !!earnedBadgeInfo;

                        return (
                            <div 
                                key={badge.id} 
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
                                        "font-bold text-sm mb-2 leading-tight",
                                        isEarned ? "text-gray-900" : "text-gray-600"
                                    )}>{badge.name}</h3>
                                </div>
                                
                                <p className="text-[11px] text-gray-500 leading-relaxed mb-4 flex-1">
                                    {badge.description || "Contribute more to unlock this badge."}
                                </p>

                                {isEarned ? (
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                        ✓ Earned
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                        🔒 Locked
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

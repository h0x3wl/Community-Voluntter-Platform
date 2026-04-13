import { Trophy, ChevronDown, DollarSign } from "lucide-react"
import { cn } from "../../lib/utils"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { useOutletContext } from "react-router-dom"

/** Format cents to dollar string */
function formatDollars(cents: number): string {
    return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function LeaderboardPage() {
    const { user: currentUser } = useOutletContext<{ user: any }>()
    const [range, setRange] = useState<"weekly" | "monthly" | "all_time">("monthly")
    const [leaders, setLeaders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLeaders = async () => {
            setIsLoading(true)
            try {
                const response = await api.getLeaderboard(range)
                setLeaders(response.data?.leaders || [])
            } catch (err) {
                console.error("Failed to fetch leaderboard", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchLeaders()
    }, [range])

    // Split leaders into top 3 (podium) and the rest
    const podium = leaders.slice(0, 3)
    // Pad podium if there aren't enough people
    while (podium.length < 3) {
        podium.push({ name: "Unclaimed", total_donated: 0, points: 0, rank: podium.length + 1, image: "", level: 1 })
    }
    
    // Sort podium to visually show 2nd, 1st, 3rd in that order from left-to-right
    const visualPodium = [podium[1], podium[0], podium[2]]
    const list = leaders.slice(3)

    return (
        <div className="space-y-12">
            {/* Header Space */}
            <div className="text-left space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Top Donors ({range.replace('_', ' ')})</h1>
                <p className="text-sm text-gray-500">Ranked by total donation amount</p>
            </div>

            {/* Podium Section */}
            <div className="flex justify-center items-end gap-4 md:gap-8 h-80">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-gray-300 to-gray-100 shadow-lg">
                            <img src={visualPodium[0]?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(visualPodium[0]?.name || 'U')}`} alt="2nd Place" className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                        <div className="absolute -bottom-2 -right-0 w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                            2nd
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-blue-50/50 to-white rounded-t-2xl p-6 w-32 md:w-40 h-48 flex flex-col items-center justify-center text-center shadow-sm border border-b-0 border-blue-100/50">
                        <p className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{visualPodium[0]?.name}</p>
                        <p className="font-extrabold text-blue-500 text-lg">{formatDollars(visualPodium[0]?.total_donated || 0)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Lvl {visualPodium[0]?.level || 1}</p>
                    </div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center z-10 -mx-4 md:mx-0">
                    <div className="relative mb-4 animate-bounce-slow">
                        {(visualPodium[1]?.total_donated || 0) > 0 && <Trophy className="w-10 h-10 text-yellow-500 absolute -top-12 left-1/2 -translate-x-1/2 drop-shadow-sm" />}
                        <div className="w-28 h-28 rounded-full p-1.5 bg-gradient-to-br from-yellow-300 to-yellow-100 shadow-xl ring-4 ring-yellow-50/50">
                            <img src={visualPodium[1]?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(visualPodium[1]?.name || 'U')}`} alt="1st Place" className="w-full h-full rounded-full object-cover border-4 border-white bg-white" />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow-md">
                            WINNER
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-t-2xl p-6 w-40 md:w-48 h-64 flex flex-col items-center justify-center text-center shadow-lg border-x border-t border-blue-200 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
                        <p className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{visualPodium[1]?.name}</p>
                        <p className="font-extrabold text-2xl text-blue-600">{formatDollars(visualPodium[1]?.total_donated || 0)}</p>
                        <p className="text-xs text-gray-400 mt-1">Lvl {visualPodium[1]?.level || 1}</p>
                    </div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-br from-orange-300 to-orange-100 shadow-lg">
                            <img src={visualPodium[2]?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(visualPodium[2]?.name || 'U')}`} alt="3rd Place" className="w-full h-full rounded-full object-cover border-2 border-white" />
                        </div>
                        <div className="absolute -bottom-2 -left-0 w-6 h-6 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm">
                            3rd
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-yellow-50/50 to-white rounded-t-2xl p-6 w-32 md:w-40 h-40 flex flex-col items-center justify-center text-center shadow-sm border border-b-0 border-yellow-100/50">
                        <p className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{visualPodium[2]?.name}</p>
                        <p className="font-extrabold text-yellow-500 text-lg">{formatDollars(visualPodium[2]?.total_donated || 0)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Lvl {visualPodium[2]?.level || 1}</p>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                {/* Filter Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex p-1 bg-gray-100 rounded-xl">
                        <button onClick={() => setRange('weekly')} className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", range === 'weekly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900')}>Weekly</button>
                        <button onClick={() => setRange('monthly')} className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", range === 'monthly' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900')}>Monthly</button>
                        <button onClick={() => setRange('all_time')} className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", range === 'all_time' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900')}>All Time</button>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">Ranked by total donations</span>
                </div>

                {/* Table */}
                <div className="space-y-2 relative min-h-[200px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-gray-500">
                            Loading Leaders...
                        </div>
                    )}
                    
                    {/* Table Header */}
                    <div className="grid grid-cols-12 px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-5 pl-4">Contributor</div>
                        <div className="col-span-2 text-center">Level</div>
                        <div className="col-span-2 text-right">Donations</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>

                    {/* Rows */}
                    {list.map((user) => {
                        const isCurrent = user.user_public_id === currentUser?.public_id
                        return (
                        <div
                            key={user.rank}
                            className={cn(
                                "grid grid-cols-12 px-6 py-4 items-center rounded-xl transition-colors",
                                isCurrent
                                    ? "bg-green-50 border border-green-100"
                                    : "hover:bg-gray-50 border border-transparent"
                            )}
                        >
                            <div className="col-span-1 text-center font-bold text-lg text-gray-500">
                                {user.rank}
                            </div>

                            <div className="col-span-5 pl-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    <img src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className={cn("font-bold text-sm truncate", isCurrent ? "text-green-900" : "text-gray-900")}>
                                            {user.name} {isCurrent && "(You)"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
                                    Lvl {user.level || 1}
                                </span>
                            </div>

                            <div className="col-span-2 text-right text-sm text-gray-500 font-medium">
                                {user.donation_count || 0}
                            </div>

                            <div className="col-span-2 text-right font-bold text-gray-900 flex items-center justify-end gap-1">
                                <DollarSign className="w-3.5 h-3.5 text-green-500" />
                                {((user.total_donated || 0) / 100).toLocaleString()}
                            </div>
                        </div>
                    )})}
                    {!isLoading && list.length === 0 && (
                        <div className="py-8 text-center text-gray-500 text-sm">
                            Be the first to step on the leaderboard!
                        </div>
                    )}
                </div>

                {/* Load More */}
                {list.length >= 10 && (
                    <div className="mt-8 text-center bg-gray-50 rounded-xl py-3 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-semibold text-gray-600 flex items-center justify-center gap-2">
                            Load More Contributors
                            <ChevronDown className="w-4 h-4" />
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

import { Button } from "../ui/button"
import { Link, useOutletContext } from "react-router-dom"
import { Calendar, Download, Users, Clock, Leaf, MoreHorizontal, ArrowUpRight } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

// SVG Circular Progress
function CircularProgress({ percentage, size = 180, strokeWidth = 12, color = "#3b82f6" }: { percentage: number; size?: number; strokeWidth?: number; color?: string }) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative flex items-center justify-center p-4">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#e2e8f0"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-gray-900">{Math.round(percentage)}%</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Achieved</span>
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, colorClass, bgClass }: { icon: any, label: string, value: string | number, colorClass: string, bgClass: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    )
}

function MilestoneCard({ title, percentage, description, colorClass, bgBarClass }: { title: string, percentage: number, description: string, colorClass: string, bgBarClass: string }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-900 line-clamp-1 mr-2">{title}</h3>
                <span className={`text-sm font-bold ${colorClass} flex-shrink-0`}>{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3">
                <div className={`h-2.5 rounded-full ${bgBarClass}`} style={{ width: `${percentage}%` }} />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </div>
    )
}

export function ImpactTrackerPage() {
    const { user } = useOutletContext<{ user: any }>()
    const [impact, setImpact] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchImpact = async () => {
            const today = new Date()
            const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
            try {
                const response = await api.getImpactTracker(monthStr)
                setImpact(response.data)
            } catch (err) {
                console.error("Failed to fetch impact", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchImpact()
    }, [])

    const progressRatio = impact?.monthly_goal_progress?.progress_ratio || 0
    const progressPercent = Math.min(progressRatio * 100, 100)
    
    return (
        <div className="space-y-8 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <span className="text-gray-500">Loading your impact...</span>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.first_name || 'Contributor'}!</h1>
                    <p className="text-gray-500">See how your contributions are making a difference today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white border-gray-200">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        Monthly View
                    </Button>
                    <Button variant="outline" className="bg-white border-gray-200">
                        <Download className="w-4 h-4 mr-2 text-gray-500" />
                        Report
                    </Button>
                </div>
            </div>

            {/* Top Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Your Community Impact</h2>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <CircularProgress percentage={progressPercent || 0} />

                        <div className="flex-1 space-y-5 text-center md:text-left">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Impact Goal</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    You have completed <span className="font-bold text-gray-900">{Math.round(progressPercent)}%</span> of your monthly goal!
                                    Every dollar contributed helps our community initiatives directly.
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center">
                                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                                    Active supporter
                                </span>
                            </div>

                            <Link to="/">
                                <Button className="w-full md:w-auto mt-2 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 font-semibold px-8">
                                    Boost Your Impact
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Column */}
                <div className="space-y-4">
                    <StatCard
                        icon={Users}
                        label="Lives Impacted"
                        value={impact?.lives_impacted || 0}
                        colorClass="text-green-600"
                        bgClass="bg-green-50"
                    />
                    <StatCard
                        icon={Clock}
                        label="Volunteer Hours"
                        value={impact?.volunteer_hours || 0}
                        colorClass="text-blue-600"
                        bgClass="bg-blue-50"
                    />
                    <StatCard
                        icon={Leaf}
                        label="Trees Planted"
                        value={impact?.trees_planted || 0}
                        colorClass="text-yellow-600"
                        bgClass="bg-yellow-50"
                    />
                </div>
            </div>

            {/* Middle Section: Milestones */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Upcoming Milestones</h2>
                    <Link to="/user/leaderboard" className="text-sm font-semibold text-blue-500 hover:text-blue-600">View All</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(impact?.milestones || []).slice(0, 2).map((ms: any, i: number) => {
                        const ratio = ms.threshold_cents ? Math.min((impact?.monthly_goal_progress?.current_cents || 0) / ms.threshold_cents, 1) : 0
                        return (
                            <MilestoneCard
                                key={ms.label || i}
                                title={ms.label}
                                percentage={ratio * 100}
                                description={ms.achieved ? "Milestone achieved! Incredible work." : `Keep going to unlock the ${ms.label} badge.`}
                                colorClass={ms.achieved ? "text-green-500" : "text-blue-500"}
                                bgBarClass={ms.achieved ? "bg-green-500" : "bg-blue-500"}
                            />
                        )
                    })}
                    {(!impact?.milestones || impact.milestones.length === 0) && (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-500">
                            No milestones active right now. 
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section: Highlights */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Community Impact Highlights</h2>

                <div className="space-y-6">
                    {(impact?.highlights || []).slice(0, 3).map((hl: any, i: number) => (
                        <div key={i} className="flex gap-4 items-start pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 text-sm">{hl.message}</h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {hl.date ? new Date(hl.date).toLocaleDateString() : 'Recent'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!impact?.highlights || impact.highlights.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-4">No recent highlights recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

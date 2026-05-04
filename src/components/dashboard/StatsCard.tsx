import type { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

interface StatsCardProps {
    title: string
    value: string
    subtext: string
    icon: LucideIcon
    iconColor: string
    bgIconColor: string
    trend?: string
    trendUp?: boolean
}

export function StatsCard({ title, value, subtext, icon: Icon, iconColor, bgIconColor, trend, trendUp }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgIconColor)}>
                    <Icon className={cn("w-5 h-5", iconColor)} />
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
                {trend && (
                    <span className={cn("font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                        {trend}
                    </span>
                )}
                <span className="text-gray-400">{subtext}</span>
            </div>
        </div>
    )
}

import { HandHeart, Clock } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { Link } from "react-router-dom"

export function RecentActivity() {
    const [donations, setDonations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const response = await api.getMyDonations()
                // Limit to 3 items
                setDonations(response.data?.slice(0, 3) || [])
            } catch (error) {
                console.error("Failed to fetch activity", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDonations()
    }, [])

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Recent Activity</h3>
                <Link to="/user/donations" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="text-sm text-gray-500 animate-pulse">Loading activity...</div>
                ) : donations.length === 0 ? (
                    <div className="text-sm text-gray-500">No recent activity found.</div>
                ) : (
                    donations.map((item: any, i: number) => (
                        <div key={item.public_id || i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-500">
                                <HandHeart className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            Donation to '{item.campaign?.title || "a campaign"}'
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            You donated <span className="font-medium text-gray-900">${((item.amount_cents || 0) / 100).toFixed(2)}</span>
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.paid_at ? new Date(item.paid_at).toLocaleDateString() : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

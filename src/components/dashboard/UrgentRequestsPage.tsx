import { UrgentRequestCard } from "./UrgentRequestCard"
import { cn } from "../../lib/utils"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "../../lib/api"

export function UrgentRequestsPage() {
    const [categories, setCategories] = useState<string[]>(["All Urgent"])
    const [activeCategory, setActiveCategory] = useState("All Urgent")
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                // In a real app we'd filter ?category=urgent on the API side.
                // Added a fallback to ensure we show something in case no campaigns are toggled for demo
                const res = await api.getCampaigns()
                const urgentList = res.data?.filter?.((c: any) => c.status === 'active' && c.is_urgent) || []
                const uniqueCats = Array.from(new Set(urgentList.map((c: any) => c.category?.name).filter(Boolean))) as string[];
                setCategories(["All Urgent", ...uniqueCats]);
                setCampaigns(urgentList)
            } catch (err) {
                console.error("Failed to fetch urgent campaigns", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCampaigns()
    }, [])

    return (
        <div className="space-y-8 relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                    <span className="text-gray-500">Loading urgent requests...</span>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="text-xs text-gray-400 mb-2">Dashboard / <span className="text-gray-900 font-medium">Urgent Requests</span></div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Urgent Volunteer Requests</h1>
                    <p className="text-gray-500 max-w-2xl">
                        High-priority needs requiring action within 24 hours. Your immediate help makes a life-saving difference in these critical situations.
                    </p>
                </div>
                <Link to="/user/applications" className="text-sm font-bold text-gray-900 hover:underline">View History</Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap",
                            activeCategory === cat
                                ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.filter(req => activeCategory === "All Urgent" || req.category?.name === activeCategory).map((req, i) => (
                    <UrgentRequestCard 
                        key={req.public_id || i}
                        title={req.title}
                        description={req.description}
                        location={req.location}
                        image={req.image_url || `https://picsum.photos/seed/${req.public_id || i}/500/300`}
                        deadline={req.days_left != null ? `Deadline: ${req.days_left} day${req.days_left !== 1 ? 's' : ''} left` : 'Ongoing campaign'}
                        timeLimit={req.days_left != null && req.days_left <= 3 ? "Critical Need" : "High Priority"}
                    />
                ))}
                {!isLoading && campaigns.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 text-sm">
                        No urgent campaigns are active at the moment.
                    </div>
                )}
            </div>
        </div>
    )
}

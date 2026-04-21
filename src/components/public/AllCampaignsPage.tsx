import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Header } from "../Header"
import { Footer } from "../Footer"
import { Search, Filter, Calendar, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function AllCampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await api.getCampaigns()
                const data = res.data || []
                data.sort((a: any, b: any) => {
                    if (a.is_urgent && !b.is_urgent) return -1
                    if (!a.is_urgent && b.is_urgent) return 1
                    return 0
                })
                setCampaigns(data)
            } catch (err) {
                console.error("Failed to fetch campaigns", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAll()
    }, [])

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Page Header */}
                <div className="bg-white border-b border-gray-100 py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">All Campaigns</h1>
                        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search causes, locations, or keywords..."
                                    className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white"
                                />
                            </div>
                            <Button variant="outline" className="h-11 border-gray-200 px-6">
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="container mx-auto px-4 py-12 relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                            <span className="text-gray-500 font-medium">Loading campaigns...</span>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaigns.map((campaign, i) => {
                            const raised = (campaign.raised_cents || 0) / 100
                            const goal = (campaign.goal_cents || 0) / 100
                            const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
                            
                            return (
                                <div key={campaign.public_id || i} className={`bg-white rounded-2xl border ${campaign.is_urgent ? 'border-red-500 shadow-red-500/10' : 'border-gray-100'} shadow-sm overflow-hidden hover:shadow-lg transition-shadow group flex flex-col`}>
                                    <Link to={`/campaigns/${campaign.share_slug || campaign.public_id || i}`} className="h-48 relative overflow-hidden block">
                                        <img 
                                            src={campaign.image_url || `https://picsum.photos/seed/${campaign.public_id || i}/400/300`} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt={campaign.title} 
                                        />
                                        {campaign.is_urgent && (
                                            <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm flex items-center gap-1">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                Urgent
                                            </span>
                                        )}
                                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-gray-900 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm">
                                            {campaign.category?.name || "Community"}
                                        </span>
                                    </Link>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <Link to={`/campaigns/${campaign.share_slug || campaign.public_id || i}`} className="block mb-2">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{campaign.title}</h3>
                                        </Link>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {campaign.description || "Help us reach our goal to provide sustainable resources to communities in need."}
                                        </p>
                                        <div className="mt-auto">
                                            <div className="flex justify-between text-xs font-bold mb-2">
                                                <span className="text-gray-900">${raised.toLocaleString()} raised</span>
                                                <span className="text-gray-400">Goal: ${goal.toLocaleString()}</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <Link to="/donate">
                                                <Button className="w-full bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 font-bold hover:border-gray-300">
                                                    Donate Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {!isLoading && campaigns.length === 0 && (
                        <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100">
                            No campaigns found.
                        </div>
                    )}

                    {/* Load More */}
                    {!isLoading && campaigns.length > 0 && (
                        <div className="mt-12 text-center">
                            <Button variant="ghost" className="text-gray-500 hover:text-gray-900 font-semibold bg-gray-50 hover:bg-gray-100 rounded-full px-6">
                                Load More Campaigns
                            </Button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}

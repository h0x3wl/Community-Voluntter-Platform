import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../lib/api"

const categoryColors = ["blue", "green", "red", "purple", "orange"]

export function FeaturedCampaigns() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await api.getCampaigns()
                // Take the first 3 active campaigns as "featured"
                const allCampaigns = res.data || []
                allCampaigns.sort((a: any, b: any) => {
                    if (a.is_urgent && !b.is_urgent) return -1
                    if (!a.is_urgent && b.is_urgent) return 1
                    return 0
                })
                const featured = allCampaigns
                    .filter((c: any) => c.status === 'active' || c.status === 'approved')
                    .slice(0, 3)
                setCampaigns(featured.length > 0 ? featured : allCampaigns.slice(0, 3))
            } catch (err) {
                console.error("Failed to fetch featured campaigns", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCampaigns()
    }, [])

    const colorClasses: Record<string, { text: string; bg: string; btn: string }> = {
        blue: { text: "text-blue-600", bg: "bg-blue-500", btn: "bg-blue-500 hover:bg-blue-600" },
        green: { text: "text-green-600", bg: "bg-green-500", btn: "bg-green-500 hover:bg-green-600" },
        red: { text: "text-red-600", bg: "bg-red-500", btn: "bg-red-500 hover:bg-red-600" },
        purple: { text: "text-purple-600", bg: "bg-purple-500", btn: "bg-purple-500 hover:bg-purple-600" },
        orange: { text: "text-orange-600", bg: "bg-orange-500", btn: "bg-orange-500 hover:bg-orange-600" },
    }

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Featured Campaigns</h2>
                        <p className="mt-2 text-gray-600">Help us change lives, one project at a time.</p>
                    </div>
                    <Link to="/campaigns" className="hidden sm:block text-primary font-medium hover:underline">
                        View all campaigns &rarr;
                    </Link>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="text-gray-400 font-medium">Loading campaigns...</span>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No campaigns available.</div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {campaigns.map((campaign: any, index: number) => {
                            const raised = (campaign.raised_cents || 0) / 100
                            const goal = (campaign.goal_cents || 1) / 100
                            const progress = Math.min((raised / goal) * 100, 100)
                            const color = categoryColors[index % categoryColors.length]
                            const colors = colorClasses[color]
                            const imageUrl = campaign.images?.[0]?.url || `https://picsum.photos/seed/${campaign.public_id || index}/800/600`
                            const categoryName = campaign.category?.name || "Community"

                            return (
                                <Card key={campaign.public_id || index} className="overflow-hidden border-none shadow-lg flex flex-col h-full">
                                    <Link to={`/campaigns/${campaign.share_slug || campaign.public_id}`} className="relative h-48 sm:h-56 block">
                                        <img
                                            src={imageUrl}
                                            alt={campaign.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                        {campaign.is_urgent && (
                                            <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide shadow-sm flex items-center gap-1">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                                Urgent
                                            </span>
                                        )}
                                        <div className={`absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${colors.text}`}>
                                            {categoryName}
                                        </div>
                                    </Link>

                                    <CardHeader className="pb-2">
                                        <Link to={`/campaigns/${campaign.share_slug || campaign.public_id}`}>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{campaign.title}</h3>
                                        </Link>
                                        <p className="text-sm text-gray-600 line-clamp-3">
                                            {campaign.description || "Help us reach our goal to provide resources to communities in need."}
                                        </p>
                                    </CardHeader>

                                    <CardContent className="py-2">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-gray-900">${raised.toLocaleString()}</span>
                                            <span className="text-gray-500">Goal: ${goal.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${colors.bg}`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </CardContent>

                                    <CardFooter className="mt-auto pt-4">
                                        <Link to="/donate" className="w-full">
                                            <Button
                                                className={`w-full ${colors.btn} text-white`}
                                                variant="outline"
                                            >
                                                Donate Now
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}

                <div className="mt-8 text-center sm:hidden">
                    <Link to="/campaigns" className="text-primary font-medium hover:underline">
                        View all campaigns &rarr;
                    </Link>
                </div>
            </div>
        </section>
    )
}

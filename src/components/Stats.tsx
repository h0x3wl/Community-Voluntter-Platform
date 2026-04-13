import { useIntersectionObserver } from "../hooks/useIntersectionObserver"
import { useEffect, useState } from "react"
import { api } from "../lib/api"

export function Stats() {
    const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.2 })
    const [stats, setStats] = useState([
        { value: "0", label: "Lives Impacted", color: "text-blue-600" },
        { value: "$0", label: "Funds Raised", color: "text-green-600" },
        { value: "0", label: "Active Campaigns", color: "text-purple-600" },
        { value: "0", label: "Volunteers", color: "text-orange-600" },
    ])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.getCampaigns()
                const campaigns = res.data || []
                const totalRaised = campaigns.reduce((acc: number, c: any) => acc + (c.raised_cents || 0), 0) / 100
                const activeCampaigns = campaigns.filter((c: any) => c.status === 'active').length
                const totalDonors = campaigns.reduce((acc: number, c: any) => acc + (c.donors_count || 0), 0)

                // Format numbers nicely
                const formatNum = (n: number) => {
                    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`
                    if (n >= 1000) return `${(n / 1000).toFixed(0)}k+`
                    return n.toString()
                }

                setStats([
                    { value: `$${formatNum(campaigns.length > 0 ? (totalRaised / campaigns.length) : 0)}`, label: "Avg. Goal Reached", color: "text-blue-600" },
                    { value: `$${formatNum(totalRaised)}`, label: "Funds Raised", color: "text-green-600" },
                    { value: activeCampaigns.toString(), label: "Active Campaigns", color: "text-purple-600" },
                    { value: formatNum(totalDonors), label: "Donors & Volunteers", color: "text-orange-600" },
                ])
            } catch (err) {
                // Keep defaults if API fails
                console.error("Failed to fetch stats", err)
            }
        }
        fetchStats()
    }, [])

    return (
        <section ref={targetRef as any} className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-500 transform ${isIntersecting ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            <h3 className={`text-4xl md:text-5xl font-extrabold mb-2 ${stat.color}`}>
                                {stat.value}
                            </h3>
                            <p className="text-gray-600 font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

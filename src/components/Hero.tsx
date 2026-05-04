import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../lib/api"

import { useIntersectionObserver } from "../hooks/useIntersectionObserver"

export function Hero() {
    const { targetRef, isIntersecting } = useIntersectionObserver()
    const [communityCount, setCommunityCount] = useState("10k+")

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await api.getCampaigns()
                const campaigns = res.data || []
                const totalDonors = campaigns.reduce((acc: number, c: any) => acc + (c.donors_count || 0), 0)
                if (totalDonors >= 1000000) {
                    setCommunityCount(`${(totalDonors / 1000000).toFixed(1)}M+`)
                } else if (totalDonors >= 1000) {
                    setCommunityCount(`${Math.floor(totalDonors / 1000)}k+`)
                } else if (totalDonors > 0) {
                    setCommunityCount(`${totalDonors}+`)
                }
            } catch {
                // Keep default
            }
        }
        fetchCount()
    }, [])

    return (
        <section ref={targetRef as any} className="relative pt-10 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 text-center lg:text-left">
                        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight mb-6 transform transition-all duration-700 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <span className="text-black">Empowering Communities for a</span> Brighter Tomorrow
                        </h1>
                        <p className={`text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 transform transition-all duration-700 delay-200 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            Join us in creating a future, where every child has the chance to dream big and achieve their goals.
                        </p>

                        <div className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10 transform transition-all duration-700 delay-300 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <Link to="/donate">
                                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-blue-500/20">
                                    Donate Now
                                </Button>
                            </Link>
                        </div>

                        <div className={`flex items-center justify-center lg:justify-start gap-4 transform transition-all duration-700 delay-500 ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                        <img
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            alt="User avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                                Join <span className="font-bold text-black">{communityCount}</span> people
                            </p>
                        </div>
                    </div>

                    <div className={`flex-1 relative transform transition-all duration-1000 ${isIntersecting ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                        <div className="relative z-10">
                            <img
                                src="/Children.png"
                                alt="Happy children standing together"
                                className="w-full h-auto max-w-lg mx-auto"
                            />
                        </div>

                        {/* Background blobs */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    )
}


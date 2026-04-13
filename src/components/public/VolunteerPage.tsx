import { Button } from "../ui/button"
import { Header } from "../Header"
import { Footer } from "../Footer"
import { Heart, Users, Calendar, MapPin, ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

export function VolunteerPage() {
    const [opportunities, setOpportunities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchOpps = async () => {
            try {
                const res = await api.getOpportunities()
                setOpportunities(res.data || [])
            } catch (err) {
                console.error("Failed to fetch opportunities", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchOpps()
    }, [])

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-green-50/50 py-20 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">Join Our Community</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Become a Volunteer</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Your time and skills can make a real difference. Join thousands of volunteers changing lives around the world.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 shadow-xl shadow-green-500/20">
                                Apply Now
                            </Button>
                        </Link>
                        <Button variant="outline" className="h-12 border-gray-200 text-gray-600 hover:text-gray-900 font-semibold bg-white hover:bg-gray-50">
                            Learn More
                        </Button>
                    </div>
                </section>

                {/* Benefits */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-green-500 inline-block pb-2">Why Volunteer With Us?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Make an Impact</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Directly contribute to projects that improve lives and strengthen communities around the globe.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Connect & Network</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Meet like-minded people and build lasting relationships with leaders within your community.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6 border border-orange-100">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Grow Professionally</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Gain new skills, leadership experience, and valuable professional references for your career.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Open Positions */}
                <section className="py-20 bg-gray-50 relative min-h-[400px]">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">Loading opportunities...</span>
                        </div>
                    )}
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-blue-500 pl-3">Open Opportunities</h2>
                        <div className="space-y-4">
                            {opportunities.map((job, i) => (
                                <div key={job.public_id || i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{job.location_type || "Flexible"}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-2xl">{job.description || "Join our team to support community operations and event management workflows."}</p>
                                        <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" /> {job.start_date || "Ongoing"}</span>
                                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" /> {job.location_type === 'remote' ? 'Remote (Anywhere)' : 'Local Community'}</span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <Link to="/register">
                                            <Button className="w-full md:w-auto bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 font-bold px-6 h-12 rounded-xl transition-all shadow-sm">
                                                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {!isLoading && opportunities.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                    <p className="text-gray-500 text-sm">There are no open positions at the moment, but check back soon!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

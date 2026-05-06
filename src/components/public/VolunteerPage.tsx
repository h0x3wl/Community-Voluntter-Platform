import { Button } from "../ui/button"
import { Header } from "../Header"
import { Footer } from "../Footer"
import { Heart, Users, CheckCircle2, HandHeart, Gift, Shirt } from "lucide-react"
import { Link } from "react-router-dom"

export function VolunteerPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-green-50/50 py-20 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">Join Our Community</span>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Support Our Cause</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Every act of kindness matters. Whether you donate, share, or lend a hand — your support helps us change lives and strengthen communities around the world.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register">
                            <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-8 shadow-xl shadow-green-500/20">
                                Get Involved
                            </Button>
                        </Link>
                        <Link to="/campaigns">
                            <Button variant="outline" className="h-12 border-gray-200 text-gray-600 hover:text-gray-900 font-semibold bg-white hover:bg-gray-50">
                                See Campaigns
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Ways to Help */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-green-500 inline-block pb-2">Ways You Can Help</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100">
                                    <Heart className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Donate Funds</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Contribute financially to campaigns that directly support communities in need. Every dollar makes a real difference.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                                    <Shirt className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Donate Clothes</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Give clothing items a second life by donating them to organizations that distribute to those who need them most.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-6 border border-orange-100">
                                    <Users className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg mb-2 text-gray-900">Spread the Word</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">Share our mission with your network and help us reach more supporters. Awareness is the first step to impact.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Support Us */}
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 border-b-2 border-blue-500 inline-block pb-2">Why Your Support Matters</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Transparent Impact</h3>
                                    <p className="text-gray-500 text-sm">Every contribution is tracked and you can see exactly how your support is being used.</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <HandHeart className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Direct Community Help</h3>
                                    <p className="text-gray-500 text-sm">Your donations go directly to verified organizations working with communities in need.</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Recognition & Rewards</h3>
                                    <p className="text-gray-500 text-sm">Earn badges and climb the leaderboard as you contribute — your generosity is celebrated.</p>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Join a Community</h3>
                                    <p className="text-gray-500 text-sm">Connect with thousands of like-minded people working together to make a lasting difference.</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/register">
                                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 px-10 shadow-xl shadow-green-500/20">
                                    Start Supporting Today
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

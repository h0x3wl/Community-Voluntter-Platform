import { Header } from "./../Header"
import { Footer } from "./../Footer"
import { Building2, Handshake, HeartHandshake } from "lucide-react"
import { Button } from "../ui/button"

export function PartnersPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />
            <main className="flex-1">
                {/* Hero */}
                <section className="bg-blue-50/50 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Corporate Partners</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We collaborate with forward-thinking organizations to amplify our impact and create lasting change.
                    </p>
                </section>

                <div className="container mx-auto px-4 py-16 -mt-10">
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-16">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Corporate Giving</h3>
                                <p className="text-sm text-gray-500 mt-2">Align your brand with impact through strategic financial donations.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <Handshake className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Employee Matching</h3>
                                <p className="text-sm text-gray-500 mt-2">Empower your employees by matching their volunteer hours and donations.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4">
                                    <HeartHandshake className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Sponsorships</h3>
                                <p className="text-sm text-gray-500 mt-2">Sponsor key events or core initiatives to directly fund our mission.</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Become a Partner</h3>
                            <p className="text-gray-600 mb-6 max-w-xl mx-auto">Contact our partnerships team today to explore how your organization can integrate with our platform.</p>
                            <Button onClick={() => window.location.href='/contact'} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-bold px-8 h-12">
                                Contact Partnerships Team
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

import { Header } from "../Header"
import { Footer } from "../Footer"
import { Mission } from "../Mission"
import { OurStory } from "../OurStory"
import { Team } from "../Team"
import { Stats } from "../Stats"

export function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <div className="bg-slate-900 text-white py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Dedicated to creating lasting change through community action and transparent giving.
                    </p>
                </div>

                {/* Reuse existing sections for efficiency */}
                <Mission />
                <Stats />
                <OurStory />
                <Team />

                {/* Values Section */}
                <section className="py-20 bg-blue-600 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-12">Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-6">
                                <div className="text-4xl mb-4">🤝</div>
                                <h3 className="text-xl font-bold mb-2">Transparency</h3>
                                <p className="text-blue-100">We believe in complete openness about where every dollar goes.</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl mb-4">🌍</div>
                                <h3 className="text-xl font-bold mb-2">Community</h3>
                                <p className="text-blue-100">Real change happens when people come together for a common cause.</p>
                            </div>
                            <div className="p-6">
                                <div className="text-4xl mb-4">⚡</div>
                                <h3 className="text-xl font-bold mb-2">Impact</h3>
                                <p className="text-blue-100">We focus on sustainable solutions that solve problems at their root.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

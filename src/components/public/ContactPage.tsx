import { Header } from "../Header"
import { Footer } from "../Footer"
import { Mail, Phone, MapPin } from "lucide-react"

export function ContactPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-blue-50/50 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about our programs or want to get involved? We'd love to hear from you.
                    </p>
                </section>

                <div className="container mx-auto px-4 py-16 -mt-10">
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 max-w-2xl mx-auto">

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Our team is available Mon-Fri from 9am to 5pm EST to assist you.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</p>
                                        <a href="mailto:contact@awn.org" className="text-sm font-medium text-gray-900 hover:text-blue-600">contact@awn.org</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone</p>
                                        <a href="tel:+15550234567" className="text-sm font-medium text-gray-900 hover:text-blue-600">+1 (555) 023-4567</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Office</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            123 Charity Lane, Suite 400<br />New York, NY 10012
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

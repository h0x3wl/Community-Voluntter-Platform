import { ChevronDown } from "lucide-react"
import { useState } from "react"

export function HelpLegal() {
    const helpLinks = [
        { title: "Where to donate", color: "text-blue-600" },
        { title: "Hosting info", color: "text-blue-600" },
        { title: "Volunteers", color: "text-blue-600" },
        { title: "Safety center", color: "text-blue-600" }
    ]

    const legals = [
        "Privacy Policy",
        "Terms of Service",
        "Cookie Policy",
        "Accessibility"
    ]

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Help Center */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Help Center & Support</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {helpLinks.map((link, i) => (
                            <a key={i} href="#" className="group">
                                <h3 className="font-semibold text-gray-900 group-hover:text-primary mb-2 transition-colors">{link.title}</h3>
                                <p className="text-sm text-gray-500">Find answers and support</p>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Legal Accordions (Mock) */}
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Legal Information</h2>
                    <div className="space-y-4">
                        {legals.map((item, i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <button className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50">
                                    {item}
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function HelpLegal() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const helpLinks = [
        { title: "Where to donate", color: "text-blue-600" },
        { title: "Hosting info", color: "text-blue-600" },
        { title: "Volunteers", color: "text-blue-600" },
        { title: "Safety center", color: "text-blue-600" }
    ]

    const legals = [
        {
            title: "Privacy Policy",
            content: "We take your privacy seriously. We collect personal data (such as name, email address, and telephone number) and derivative usage data to provide a smooth, efficient, and customized volunteering and donation experience."
        },
        {
            title: "Terms of Service",
            content: "By using our platform, you agree to comply with our terms. All materials, services, and content are the property of the platform, and user behavior must adhere to our community guidelines and safety protocols."
        },
        {
            title: "Cookie Policy",
            content: "We use cookies and similar tracking technologies to track platform activity and store user preferences. This helps us optimize performance, analyze traffic, and personalize your experience."
        },
        {
            title: "Accessibility",
            content: "We are committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards."
        }
    ]

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

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

                {/* Legal Accordions */}
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Legal Information</h2>
                    <div className="space-y-4">
                        {legals.map((item, i) => (
                            <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <button
                                    onClick={() => toggleAccordion(i)}
                                    className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <span>{item.title}</span>
                                    <ChevronDown
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                            openIndex === i ? "transform rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {openIndex === i && (
                                    <div className="p-4 pt-0 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
                                        {item.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

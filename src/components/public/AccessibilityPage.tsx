import { Header } from "./../Header"
import { Footer } from "./../Footer"

export function AccessibilityPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Accessibility Statement</h1>
                <div className="prose max-w-none text-gray-600 space-y-6">
                    <p>We are committed to ensuring our platform is accessible to all individuals, regardless of physical or cognitive ability.</p>
                    
                    <h2 className="text-xl font-bold text-gray-900 mt-8">Our Standards</h2>
                    <p>We strive to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. This ensures our digital experiences are perceivable, operable, understandable, and robust.</p>
                    
                    <h2 className="text-xl font-bold text-gray-900 mt-8">Features Integrated</h2>
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li>Semantic HTML architecture to support screen readers.</li>
                        <li>High contrast modes and distinct hover states for visual clarity.</li>
                        <li>Full keyboard navigability across core donor and volunteer workflows.</li>
                        <li>Dynamic scaling for text elements.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900 mt-8">Feedback</h2>
                    <p>Accessibility is an ongoing effort. If you encounter any barriers while using our platform, please reach out to us via our <a href="/contact" className="text-blue-600 hover:underline">Contact Page</a> so we can address the issue promptly.</p>
                </div>
            </main>
            <Footer />
        </div>
    )
}

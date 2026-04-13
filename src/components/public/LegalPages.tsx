import { Header } from "../Header"
import { Footer } from "../Footer"

export function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
                <div className="prose max-w-none text-gray-600 space-y-6">
                    <p>Last updated: October 1, 2023</p>
                    <p>At Awn, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website.</p>

                    <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
                    <p>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number.</li>
                        <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-gray-900">Use of Your Information</h2>
                    <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Process donations and payments.</li>
                        <li>Send you a newsletter.</li>
                        <li>Request feedback and contact you about your use of the Site.</li>
                    </ul>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export function TermsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
                <div className="prose max-w-none text-gray-600 space-y-6">
                    <p>Last updated: October 1, 2023</p>
                    <p>Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Awn website operated by us.</p>

                    <h2 className="text-xl font-bold text-gray-900">Conditions of Use</h2>
                    <p>By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to leave the website accordingly.</p>

                    <h2 className="text-xl font-bold text-gray-900">Intellectual Property</h2>
                    <p>You agree that all materials, products, and services provided on this website are the property of Awn, its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property.</p>
                </div>
            </main>
            <Footer />
        </div>
    )
}

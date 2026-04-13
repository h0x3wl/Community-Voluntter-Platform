import { Button } from "../ui/button"
import { Check } from "lucide-react"
import { Link } from "react-router-dom"

export function RegisterSuccessPage() {
    const userStr = localStorage.getItem("user")
    let dashboardPath = "/user"
    if (userStr) {
        try {
            const user = JSON.parse(userStr)
            if (user?.role === "platform_admin") dashboardPath = "/admin"
            else if (user?.role === "org_admin") dashboardPath = "/org"
        } catch(e) {}
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden font-sans text-slate-900">

            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full" />
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-50 rounded-full" />

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center relative z-10 px-4">
                <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Complete</h1>

                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Thank you for joining. Your support makes a difference
                    </p>

                    <Link to={dashboardPath}>
                        <Button className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
                            Continue to Dashboard &rarr;
                        </Button>
                    </Link>

                    <div className="mt-8 text-xs text-gray-400">
                        <p>Didn't receive the email?</p>
                        <p>Check your spam folder or <a href="#" className="text-blue-500 hover:underline">click here to resend</a></p>
                    </div>
                </div>
            </div>

            {/* Minimal Footer */}
            <footer className="py-8 text-center relative z-10">
                <div className="flex justify-center gap-6 text-xs text-gray-500 mb-2">
                    <a href="#" className="hover:text-gray-900">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-900">Terms of Service</a>
                    <a href="#" className="hover:text-gray-900">Help Center</a>
                </div>
                <p className="text-xs text-gray-400">© 2024 Charity Name. All rights reserved.</p>
            </footer>
        </div>
    )
}

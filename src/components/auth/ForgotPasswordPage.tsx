import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { api } from "../../lib/api"

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")
        setIsLoading(true)

        try {
            await api.forgotPassword(email)
            setIsSubmitted(true)
        } catch (error: any) {
            setErrorMsg(error.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden font-sans text-slate-900">

            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full" />
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-50 rounded-full" />

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center relative z-10 px-4">
                <div className="bg-white rounded-2xl shadow-sm p-12 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <RefreshCw className="w-8 h-8 text-blue-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Forgot Password?</h1>

                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        Enter the email associated with your account and we'll send you an email with instructions to reset your password.
                    </p>

                    {errorMsg && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-6 text-left">
                            {errorMsg}
                        </div>
                    )}

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="text-left space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="h-12 bg-gray-50 border-gray-200"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20">
                                {isLoading ? "Sending..." : "Send Instructions"}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm">
                                Instructions have been sent to <strong>{email}</strong>.
                            </div>
                            <Button
                                onClick={() => setIsSubmitted(false)}
                                variant="outline"
                                className="w-full h-12"
                            >
                                Try another email
                            </Button>
                        </div>
                    )}

                    <div className="mt-8">
                        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Log In
                        </Link>
                    </div>

                    <div className="mt-8 text-xs text-blue-500">
                        <a href="#">Need help? Contact Support</a>
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
                <p className="text-xs text-gray-400">© 2026 Awn. All rights reserved.</p>
            </footer>
        </div>
    )
}

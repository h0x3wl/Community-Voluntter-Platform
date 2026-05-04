import { Button } from "../ui/button"
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

export function DonationFailurePage() {
    const location = useLocation()
    const errorReason = (location.state as any)?.error || "Your payment could not be processed at this time."

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">

                {/* Error Icon */}
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 px-4">
                    We were unable to process your donation. No charges have been made to your account.
                </p>

                {/* Error Details */}
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-sm text-red-700">
                    <p className="font-semibold mb-1">Reason</p>
                    <p className="text-red-600">{errorReason}</p>
                </div>

                {/* Troubleshooting Tips */}
                <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left text-sm">
                    <h3 className="font-bold text-gray-900 mb-3">Troubleshooting Tips</h3>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            Double-check your card number, expiry date, and CVV
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            Make sure you have sufficient funds available
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            Try a different payment method or card
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            Contact your bank if the issue persists
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/donate">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30">
                            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button variant="outline" className="w-full font-semibold text-gray-700 border-gray-200 hover:bg-gray-50">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                        </Button>
                    </Link>
                </div>

                <p className="text-[10px] text-gray-300 mt-8">
                    © 2026 Awn. Together for a better world.
                </p>

            </div>
        </div>
    )
}

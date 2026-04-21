import { Button } from "../ui/button"
import { CheckCircle2, Share2, Copy, FileText, ArrowRight, Loader2 } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { api } from "../../lib/api"

interface DonationData {
    public_id: string
    amount_cents: number
    currency: string
    status: string
    paid_at: string
    is_anonymous?: boolean
    xp_earned?: number
    campaign?: {
        title: string
    }
}

export function DonationSuccessPage() {
    const [searchParams] = useSearchParams()
    const donationId = searchParams.get("id")
    const [donation, setDonation] = useState<DonationData | null>(null)
    const [isLoading, setIsLoading] = useState(!!donationId)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (!donationId) return

        const fetchDonation = async () => {
            try {
                const res = await api.getDonation(donationId)
                setDonation(res.data || res)
            } catch (err) {
                console.error("Failed to fetch donation details", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchDonation()
    }, [donationId])

    const amount = donation ? (donation.amount_cents / 100) : 0
    const amountFormatted = `$${amount.toFixed(2)}`

    const date = donation?.paid_at
        ? new Date(donation.paid_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const time = donation?.paid_at
        ? new Date(donation.paid_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

    const confirmationId = donation?.public_id
        ? `#${donation.public_id.slice(0, 8).toUpperCase()}`
        : "#---"
    const campaignName = donation?.campaign?.title || "General Fund"
    const impactFamilies = Math.floor(amount / 25) || 1

    const handleCopyId = () => {
        if (donation?.public_id) {
            navigator.clipboard.writeText(donation.public_id)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-500">Loading donation details...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">

                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {donation ? `You just donated ${amountFormatted}!` : 'Donation Successful!'}
                </h1>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">
                    Thank you for your generous contribution{donation?.campaign?.title ? ` to ${donation.campaign.title}` : ''}. Your support directly enables us to continue our mission of providing sustainable resources to communities in need.
                </p>

                {/* Receipt Box */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6 text-sm">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-4">
                        <span className="text-gray-500">Transaction Amount</span>
                        <span className="font-bold text-xl text-gray-900">{amountFormatted}</span>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date & Time</span>
                            <span className="font-semibold text-gray-900">{date} • {time}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Confirmation ID</span>
                            <span className="font-semibold text-gray-900 font-mono">{confirmationId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Project Supported</span>
                            <span className="font-semibold text-blue-600">{campaignName}</span>
                        </div>
                    </div>
                </div>

                {/* Impact Badge */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center justify-center gap-2 mb-4">
                    <span className="text-lg">🌱</span>
                    <span className="text-xs font-bold text-green-700">Impact: Your donation will provide {impactFamilies} clean water kit{impactFamilies !== 1 ? "s" : ""} today.</span>
                </div>

                {/* XP Badge */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span className="text-xs font-bold text-indigo-700">XP Earned</span>
                    </div>
                    <span className="font-extrabold text-indigo-600">+{(donation as any)?.xp_earned || Math.round(amount * 10)} XP</span>
                </div>

                {donation?.is_anonymous && (
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center justify-center gap-2 mb-4">
                        <span className="text-lg">🔒</span>
                        <span className="text-xs font-bold text-amber-700">Anonymous Donation — Your identity is hidden from public views, but your XP and level still update privately.</span>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Link to="/user">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/30">
                            Return to Dashboard
                        </Button>
                    </Link>
                    <Button variant="outline" className="w-full font-semibold text-gray-700 border-gray-200 hover:bg-gray-50">
                        <FileText className="w-4 h-4 mr-2" /> View Receipt
                    </Button>
                </div>

                <Link to="/donate" className="text-xs font-semibold text-blue-500 hover:text-blue-600 flex items-center justify-center gap-1 mb-10">
                    Explore other active initiatives <ArrowRight className="w-3 h-3" />
                </Link>

                <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Share the impact</p>
                    <div className="flex justify-center gap-3">
                        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCopyId}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Copy Confirmation ID"
                        >
                            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <p className="text-[10px] text-gray-300 mt-8">
                    © 2026 Awn. Together for a better world.
                </p>

            </div>
        </div>
    )
}

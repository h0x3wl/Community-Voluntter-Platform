import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Check, ChevronRight, Info, Search, CreditCard, Lock, ShieldCheck, Receipt, AlertCircle } from "lucide-react"
import { api } from "../../lib/api"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const STRIPE_PK = import.meta.env.VITE_STRIPE_PK || ""
const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

const CARD_ELEMENT_OPTIONS = {
    hidePostalCode: true,
    style: {
        base: {
            fontSize: '16px',
            color: '#1f2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            '::placeholder': { color: '#9ca3af' },
            padding: '12px',
        },
        invalid: { color: '#ef4444', iconColor: '#ef4444' },
    },
}

/** Luhn algorithm – validates credit card numbers client-side */
function luhnCheck(value: string): boolean {
    const digits = value.replace(/\D/g, "")
    if (digits.length < 13 || digits.length > 19) return false
    let sum = 0
    let alt = false
    for (let i = digits.length - 1; i >= 0; i--) {
        let n = parseInt(digits[i], 10)
        if (alt) { n *= 2; if (n > 9) n -= 9 }
        sum += n
        alt = !alt
    }
    return sum % 10 === 0
}

function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    return digits.replace(/(.{4})/g, "$1 ").trim()
}

function formatExpiry(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + " / " + digits.slice(2)
    return digits
}

interface Campaign {
    public_id: string
    share_slug: string
    title: string
    status: string
}

function DonationPageInner({ stripe, elements }: { stripe?: any; elements?: any }) {
    const [searchParams] = useSearchParams()
    const initialAmount = Number(searchParams.get("amount")) || 10

    const [selectedAmount, setSelectedAmount] = useState<number | null>(initialAmount)
    const [customAmount, setCustomAmount] = useState<string>("")
    const [step, setStep] = useState(1)
    const navigate = useNavigate()

    // Card fields
    const [cardNumber, setCardNumber] = useState("")
    const [cardExpiry, setCardExpiry] = useState("")
    const [cardCvv, setCardCvv] = useState("")
    const [cardholderName, setCardholderName] = useState("")
    const [saveCard, setSaveCard] = useState(false)

    // Validation states
    const [cardError, setCardError] = useState("")
    const [formError, setFormError] = useState("")

    // Campaigns from API
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [selectedCampaignId, setSelectedCampaignId] = useState<string>("")
    const [campaignsLoading, setCampaignsLoading] = useState(true)

    // Processing state
    const [isProcessing, setIsProcessing] = useState(false)

    // Anonymous donation
    const [isAnonymous, setIsAnonymous] = useState(false)

    // Fetch campaigns on mount
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await api.getCampaigns()
                const allCampaigns = (res.data || [])
                    .filter((c: any) => c.status === "active" || c.status === "approved")
                setCampaigns(allCampaigns)
                // Pre-select from URL or first campaign
                const urlCampaign = searchParams.get("campaign")
                if (urlCampaign) {
                    setSelectedCampaignId(urlCampaign)
                }
            } catch (err) {
                console.error("Failed to fetch campaigns", err)
            } finally {
                setCampaignsLoading(false)
            }
        }
        fetchCampaigns()
    }, [searchParams])

    const handleAmountClick = (amount: number) => {
        setSelectedAmount(amount)
        setCustomAmount("")
    }

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value)
        setSelectedAmount(null)
    }


    const handleContinue = () => {
        if (step === 1) {
            if (donationAmount <= 0) {
                setFormError("Please select or enter a donation amount.")
                return
            }
            setFormError("")
            setStep(2)
        }
    }

    const handleSubmitPayment = async () => {
        if (!cardholderName.trim()) {
            setFormError("Please enter the cardholder name.")
            return
        }
        // Validate manual card fields in simulation mode
        if (!useStripeElements) {
            const rawCard = cardNumber.replace(/\s/g, "")
            if (!luhnCheck(rawCard)) {
                setCardError("Invalid card number. Please check and try again.")
                return
            }
            if (!cardExpiry || cardExpiry.replace(/\D/g, "").length < 4) {
                setFormError("Please enter a valid expiry date (MM / YY).")
                return
            }
            if (!cardCvv || cardCvv.length < 3) {
                setFormError("Please enter a valid CVV.")
                return
            }
        }

        setFormError("")
        setCardError("")
        setIsProcessing(true)

        try {
            const userStr = localStorage.getItem("user")
            const user = userStr ? JSON.parse(userStr) : null

            const payload: any = {
                amount: donationAmount,
                currency: "USD",
                cardholder_name: cardholderName,
            }
            if (selectedCampaignId) payload.campaign_id = selectedCampaignId
            if (user) {
                payload.donor_name = `${user.first_name || ""} ${user.last_name || ""}`.trim()
                payload.donor_email = user.email
            }
            payload.anonymous = isAnonymous

            if (stripe && elements && stripePromise) {
                // --- Real Stripe flow ---
                const intentRes = await api.createDonationIntent(payload)
                const clientSecret = intentRes.data?.client_secret
                const donationPublicId = intentRes.data?.donation?.public_id
                if (!clientSecret) throw new Error("Failed to create payment intent.")

                const cardElement = elements.getElement(CardElement)
                if (!cardElement) throw new Error("Card element not found.")

                const { error } = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: { name: cardholderName },
                    },
                })

                if (error) {
                    setCardError(error.message || "Payment failed.")
                    setIsProcessing(false)
                    return
                }
                navigate(`/donate/success?id=${donationPublicId}`)
            } else {
                // --- Simulation fallback (no Stripe key) ---
                payload.card_number = cardNumber.replace(/\s/g, "")
                payload.card_expiry = cardExpiry
                payload.card_cvv = cardCvv
                const response = await api.simulateDonation(payload)
                if (response.data?.donation) {
                    navigate(`/donate/success?id=${response.data.donation.public_id}`)
                } else {
                    navigate("/donate/failure", { state: { error: "Unexpected response from server." } })
                }
            }
        } catch (error: any) {
            const errorMsg = error.message || "Payment processing failed."
            navigate("/donate/failure", { state: { error: errorMsg } })
        } finally {
            setIsProcessing(false)
        }
    }

    const donationAmount = selectedAmount || Number(customAmount) || 0
    const useStripeElements = !!(stripe && elements && stripePromise)
    // Move this before render so the submit handler can also reference it
    // (useStripeElements is used in handleSubmitPayment via closure)
    const selectedCampaign = campaigns.find(c => c.public_id === selectedCampaignId)

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-12">
                    {step === 2 && <div className="text-sm font-semibold text-gray-500 mb-1">Donation / Payment Method</div>}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {step === 1 ? "Make a Donation" : step === 2 ? "Select Payment Method" : "Processing..."}
                    </h1>
                    <p className="text-gray-500">
                        {step === 1
                            ? "Your contribution makes a direct impact on those in need. Follow the steps below to complete your gift."
                            : step === 2 ? "All transactions are secure and encrypted." : "Please wait while we process your donation."
                        }
                    </p>
                </div>

                {/* Stepper */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 max-w-3xl mx-auto">
                    <div className="flex items-center justify-between relative px-4 md:px-12">
                        <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-100 -z-10 mx-8 md:mx-16" />
                        <div
                            className="absolute left-0 top-1/2 h-1 bg-blue-500 -z-10 mx-8 md:mx-16 transition-all duration-300"
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%', maxWidth: 'calc(100% - 4rem)' }}
                        />
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${step >= s ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-400"
                                    }`}>
                                    {step > s ? <Check className="w-5 h-5" /> : s}
                                </div>
                                <span className={`text-xs font-semibold ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
                                    {s === 1 ? "Select Amount" : s === 2 ? "Payment Method" : "Confirmation"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Global form error */}
                {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 max-w-3xl mx-auto flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {formError}
                    </div>
                )}

                {/* Content Area */}
                {step === 1 ? (
                    /* STEP 1: Amount Selection */
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-3xl mx-auto">

                        <h2 className="text-xl font-bold text-gray-900 mb-6">Choose an amount</h2>

                        {/* Amount Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[10, 25, 50, 100].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleAmountClick(amount)}
                                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 h-24 ${selectedAmount === amount
                                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-500"
                                        : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    <span className="text-2xl font-bold">${amount}</span>
                                    <span className="text-[10px] font-bold uppercase opacity-60">
                                        {amount === 10 ? "Basic Support" : amount === 25 ? "Impact Gift" : amount === 50 ? "Change Maker" : "Champion"}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div className="mb-8">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Or enter a custom amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={customAmount}
                                    onChange={handleCustomAmountChange}
                                    className={`pl-8 h-12 text-lg font-semibold bg-gray-50 border-gray-200 focus:bg-white transition-all ${customAmount ? "border-blue-500 ring-1 ring-blue-500" : ""
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Campaign Selector (Dynamic) */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Search className="w-3 h-3" />
                                </div>
                                <label className="text-sm font-bold text-gray-900">Where should we direct your gift?</label>
                            </div>

                            {campaignsLoading ? (
                                <div className="h-11 flex items-center text-sm text-gray-400">Loading campaigns...</div>
                            ) : (
                                <select
                                    value={selectedCampaignId}
                                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                                    className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow cursor-pointer"
                                >
                                    <option value="">General Fund (Greatest Need)</option>
                                    {campaigns.map((c) => (
                                        <option key={c.public_id} value={c.public_id}>
                                            {c.title}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                                <Info className="w-3.5 h-3.5" />
                                All donations are secure and tax-deductible according to local laws.
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <button
                                onClick={() => navigate("/")}
                                className="text-gray-500 font-semibold text-sm hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Back to Home
                            </button>
                            <Button
                                onClick={handleContinue}
                                disabled={donationAmount <= 0}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8 h-12 rounded-lg shadow-lg shadow-blue-500/20 font-bold text-base flex items-center gap-2 disabled:opacity-50"
                            >
                                Continue to Payment <ChevronRight className="w-4 h-4 text-white/90" />
                            </Button>
                        </div>
                    </div>
                ) : step === 2 ? (
                    /* STEP 2: Payment Method (2-Column Layout) */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main: Payment Form */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Payment Tabs */}
                            <div className="bg-gray-100 p-1 rounded-xl flex">
                                <button
                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all bg-white text-gray-900 shadow-sm"
                                >
                                    <CreditCard className="w-4 h-4" /> Credit Card
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-gray-900">Card Information</h2>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 rounded text-[10px] font-bold border bg-blue-50 text-blue-600 border-blue-100">VISA</div>
                                        <div className="px-2 py-1 rounded text-[10px] font-bold border bg-red-50 text-red-600 border-red-100">MC</div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Stripe Card Element */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Card Details</label>
                                        {useStripeElements ? (
                                            <div className={`bg-gray-50 border rounded-md p-3 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 ${cardError ? "border-red-400 ring-1 ring-red-300" : "border-gray-200"}`}>
                                                <CardElement options={CARD_ELEMENT_OPTIONS} onChange={(e) => { setCardError(e.error?.message || "") }} />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-xs text-amber-700 flex items-center gap-2 mb-3">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                    Simulation Mode — no real charges will be made.
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Card Number</label>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="4242 4242 4242 4242"
                                                                value={cardNumber}
                                                                onChange={(e) => { setCardNumber(formatCardNumber(e.target.value)); setCardError("") }}
                                                                className={`bg-gray-50 border-gray-200 focus:bg-white pl-4 pr-10 h-11 ${cardError ? "border-red-400 ring-1 ring-red-300" : ""}`}
                                                                maxLength={19}
                                                            />
                                                            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Expiry Date</label>
                                                            <Input
                                                                placeholder="MM / YY"
                                                                value={cardExpiry}
                                                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                                className="bg-gray-50 border-gray-200 focus:bg-white h-11"
                                                                maxLength={7}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">CVV</label>
                                                            <div className="relative">
                                                                <Input
                                                                    placeholder="123"
                                                                    value={cardCvv}
                                                                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                                    className="bg-gray-50 border-gray-200 focus:bg-white h-11"
                                                                    maxLength={4}
                                                                    type="password"
                                                                />
                                                                <Info className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 cursor-help" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {cardError && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {cardError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Name on Card</label>
                                        <Input
                                            placeholder="Jane Doe"
                                            value={cardholderName}
                                            onChange={(e) => setCardholderName(e.target.value)}
                                            className="bg-gray-50 border-gray-200 focus:bg-white h-11"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="save-card"
                                            checked={saveCard}
                                            onChange={(e) => setSaveCard(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="save-card" className="text-sm text-gray-500">Save card for future donations</label>
                                    </div>

                                    <div className="flex items-center gap-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="anonymous-donation"
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="anonymous-donation" className="text-sm text-gray-500">Donate anonymously <span className="text-xs text-gray-400">(your name will be hidden from public lists)</span></label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 py-4">
                                <div className="flex items-center gap-2 text-green-600">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">PCI Compliant</span>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">256-BIT SSL</span>
                                </div>
                            </div>

                        </div>

                        {/* Sidebar: Summary */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6">Donation Summary</h3>

                                <div className="space-y-4 text-sm pb-6 border-b border-gray-100">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Campaign</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedCampaign?.title || "General Fund"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Frequency</span>
                                        <span className="font-semibold text-gray-900">One-time donation</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Processing Fee</span>
                                        <span className="font-semibold text-gray-900">$0.00</span>
                                    </div>
                                    {isAnonymous && (
                                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                            <span className="text-amber-600 text-xs font-bold">🔒 Anonymous</span>
                                            <span className="text-amber-500 text-xs">Your name will be hidden</span>
                                        </div>
                                    )}
                                </div>

                                <div className="py-4 px-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 mb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-indigo-600 uppercase">XP You'll Earn</span>
                                        <span className="font-extrabold text-indigo-700">+{Math.round(donationAmount * 10 * (donationAmount >= 100 ? 1.5 : donationAmount >= 50 ? 1.25 : 1))} XP</span>
                                    </div>
                                    <p className="text-[10px] text-indigo-400">Earn XP to level up and unlock achievements{isAnonymous ? ' (tracked privately)' : ''}</p>
                                </div>

                                <div className="py-6 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-extrabold text-blue-500">${donationAmount.toFixed(2)}</span>
                                </div>

                                <Button
                                    onClick={handleSubmitPayment}
                                    disabled={isProcessing}
                                    className="w-full bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 font-bold h-12 text-base mb-3 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" /> Complete Donation
                                        </>
                                    )}
                                </Button>

                                <button
                                    onClick={() => { setStep(1); setFormError(""); }}
                                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                                >
                                    ← Back to amount selection
                                </button>

                                <p className="text-[10px] text-gray-400 text-center leading-relaxed px-2 mt-2">
                                    By completing this donation, you agree to our Terms of Service and Privacy Policy. All donations are tax-deductible.
                                </p>
                            </div>

                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex gap-3">
                                <div className="mt-1">
                                    <Receipt className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-700 text-xs uppercase mb-1">Your Impact</h4>
                                    <p className="text-xs text-blue-600 leading-relaxed">
                                        This donation will provide clean water for {Math.floor(donationAmount / 25) || 1} families for a month.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}



                {/* Footer Cards (Only on Step 1) */}
                {step === 1 && campaigns.length >= 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-3xl mx-auto">
                        {campaigns.slice(0, 2).map((campaign, index) => (
                            <button
                                key={campaign.public_id}
                                onClick={() => setSelectedCampaignId(campaign.public_id)}
                                className={`bg-white p-4 rounded-xl border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow text-left group ${selectedCampaignId === campaign.public_id ? "border-blue-300 ring-1 ring-blue-200" : "border-gray-100"
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden ${index === 0 ? "bg-green-100" : "bg-orange-100"}`}>
                                    <img
                                        src={`https://picsum.photos/seed/${campaign.public_id}/100/100`}
                                        className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity"
                                        alt={campaign.title}
                                    />
                                </div>
                                <div>
                                    <p className={`text-[10px] font-bold uppercase mb-0.5 ${index === 0 ? "text-green-600" : "text-blue-600"}`}>
                                        {index === 0 ? "Trending" : "Impactful"}
                                    </p>
                                    <h4 className="font-bold text-gray-900">{campaign.title}</h4>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

/** Small wrapper that extracts Stripe hooks and passes them as props */
function StripeInnerWrapper() {
    const stripe = useStripe()
    const elements = useElements()
    return <DonationPageInner stripe={stripe} elements={elements} />
}

/** Exported wrapper that provides Stripe context when a key is available */
export function DonationPage() {
    if (stripePromise) {
        return (
            <Elements stripe={stripePromise}>
                <StripeInnerWrapper />
            </Elements>
        )
    }
    return <DonationPageInner />
}

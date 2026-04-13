import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { cn } from "../lib/utils"

import { useNavigate } from "react-router-dom"

export function MakeDonation() {
    const [frequency, setFrequency] = useState<"one-time" | "monthly">("one-time")
    const [amount, setAmount] = useState<number | null>(null)
    const navigate = useNavigate()

    const amounts = [10, 25, 50, 100]

    const handleDonate = () => {
        const params = amount ? `?amount=${amount}` : ''
        navigate(`/donate${params}`)
    }

    return (
        <section className="py-24 bg-blue-50/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="p-8 sm:p-12">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Make a Donation</h2>

                        {/* Frequency Tabs */}
                        <div className="flex p-1 bg-gray-100 rounded-lg mb-8 max-w-sm mx-auto">
                            {["one-time", "monthly"].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFrequency(f as any)}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize",
                                        frequency === f ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Amount Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {amounts.map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={cn(
                                        "h-12 border rounded-xl font-semibold transition-all",
                                        amount === val
                                            ? "border-primary bg-blue-50 text-primary"
                                            : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/50"
                                    )}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div className="mb-8">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Or enter custom amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-8 h-12 text-lg"
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <Button onClick={handleDonate} className="w-full h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                            Donate {amount ? `$${amount}` : ""}
                        </Button>

                        <p className="mt-4 text-center text-xs text-gray-500">
                            Secure donation processed by Stripe. You can cancel monthly donations at any time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

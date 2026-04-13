import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { CheckCircle2 } from "lucide-react"
import { api } from "../lib/api"

export function Newsletter() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        
        setStatus("submitting")
        
        try {
            const res = await api.subscribeNewsletter(email)
            setStatus("success")
            setMessage(res.data?.message || "Thanks for subscribing!")
            setEmail("")
        } catch (err: any) {
            setStatus("error")
            setMessage(err.message || "Something went wrong. Please try again.")
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    return (
        <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 sm:px-12 lg:px-16 text-center">
                <div className="relative z-10 mx-auto max-w-2xl">
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                        Join our movement
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                        Get updates on our latest campaigns and find out how you can make a difference.
                    </p>

                    {status === "success" ? (
                        <div className="flex items-center justify-center gap-2 p-4 bg-white/10 rounded-xl max-w-md mx-auto text-white">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <span className="font-medium">{message}</span>
                        </div>
                    ) : status === "error" ? (
                        <div className="flex items-center justify-center gap-2 p-4 bg-red-500/20 rounded-xl max-w-md mx-auto text-white">
                            <span className="font-medium">{message}</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <Input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="bg-white/90 text-slate-900 border-0 h-11 placeholder:text-gray-500"
                                disabled={status === "submitting"}
                            />
                            <Button 
                                type="submit" 
                                variant="secondary" 
                                className="bg-white text-primary hover:bg-gray-100 font-semibold h-11 px-8"
                                disabled={status === "submitting"}
                            >
                                {status === "submitting" ? "Subscribing..." : "Subscribe"}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Abstract background shapes */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            </div>
        </section>
    )
}

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Header } from "../Header"
import { Footer } from "../Footer"
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"
import { api } from "../../lib/api"

export function ContactPage() {
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle")
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        subject: "General Inquiry",
        message: ""
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus("submitting")

        try {
            await api.submitContactForm({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
            })
            setStatus("success")
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                subject: "General Inquiry",
                message: ""
            })
        } catch (err: any) {
            console.error("Contact form error:", err)
            setStatus("idle")
            alert(err.message || "Failed to send message. Please try again.")
        }
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-blue-50/50 py-20 px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions about our programs or want to get involved? We'd love to hear from you.
                    </p>
                </section>

                <div className="container mx-auto px-4 py-16 -mt-10">
                    <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100 max-w-5xl mx-auto flex flex-col md:flex-row gap-12">

                        {/* Contact Info */}
                        <div className="w-full md:w-1/3 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Our team is available Mon-Fri from 9am to 5pm EST to assist you.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Email</p>
                                        <a href="mailto:contact@awn.org" className="text-sm font-medium text-gray-900 hover:text-blue-600">contact@awn.org</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone</p>
                                        <a href="tel:+15550234567" className="text-sm font-medium text-gray-900 hover:text-blue-600">+1 (555) 023-4567</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Office</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            123 Charity Lane, Suite 400<br />New York, NY 10012
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="flex-1 md:border-l md:border-gray-100 md:pl-12">
                            {status === "success" ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">Message Sent!</h3>
                                    <p className="text-gray-500 max-w-sm">
                                        Thank you for reaching out. A member of our team will get back to you within 24 hours.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setStatus("idle")}
                                        className="mt-4"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Send us a Message</h3>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                                <Input 
                                                    required 
                                                    name="firstName" 
                                                    value={formData.firstName} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Jane" 
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                                <Input 
                                                    required 
                                                    name="lastName" 
                                                    value={formData.lastName} 
                                                    onChange={handleInputChange} 
                                                    placeholder="Doe" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                                            <Input 
                                                required 
                                                type="email" 
                                                name="email" 
                                                value={formData.email} 
                                                onChange={handleInputChange} 
                                                placeholder="jane@example.com" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Subject</label>
                                            <select 
                                                name="subject" 
                                                value={formData.subject} 
                                                onChange={handleInputChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <option>General Inquiry</option>
                                                <option>Volunteering</option>
                                                <option>Partnership</option>
                                                <option>Donation Issue</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Message</label>
                                            <textarea
                                                required
                                                name="message"
                                                value={formData.message}
                                                onChange={handleInputChange}
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px]"
                                                placeholder="How can we help you?"
                                            />
                                        </div>
                                        <Button 
                                            type="submit" 
                                            disabled={status === "submitting"}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 font-bold"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            {status === "submitting" ? "Sending..." : "Send Message"}
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}

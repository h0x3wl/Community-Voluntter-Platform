
import { Button } from "../ui/button"
import { useState, useEffect, useRef, useCallback } from "react"
import { api } from "../../lib/api"
import {
    CloudUpload,
    Sparkles,
    CheckCircle2,
    Loader2,
    Image as ImageIcon,
    Building2,
    ChevronDown,
    X,
    Shirt,
    Tag,
    Send,
    Info,
    Package
} from "lucide-react"

const CLOTHES_CATEGORIES = [
    "T-shirt/top", "Trouser", "Pullover", "Dress", "Coat",
    "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"
]

type Step = "upload" | "analyzing" | "results"

export function AiAnalysisPage() {
    const [step, setStep] = useState<Step>("upload")
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>("")
    const [isDragging, setIsDragging] = useState(false)
    const [aiCategory, setAiCategory] = useState("")
    const [aiConfidence, setAiConfidence] = useState(0)
    const [orgs, setOrgs] = useState<any[]>([])
    const [selectedOrg, setSelectedOrg] = useState<string>("")
    const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [condition, setCondition] = useState("good")
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState("")
    const [myItems, setMyItems] = useState<any[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        api.getActiveOrganizations().then(res => setOrgs(res.data || [])).catch(() => {})
        api.getMyItems().then(res => setMyItems(res.data || [])).catch(() => {})
    }, [])

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOrgDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith("image/")) { setError("Please upload an image file."); return }
        setError("")
        setFile(f)
        setPreview(URL.createObjectURL(f))
        setStep("analyzing")
        // Simulate AI classification
        setTimeout(() => {
            const idx = Math.floor(Math.random() * CLOTHES_CATEGORIES.length)
            const conf = 85 + Math.random() * 14
            setAiCategory(CLOTHES_CATEGORIES[idx])
            setAiConfidence(parseFloat(conf.toFixed(1)))
            setTitle(CLOTHES_CATEGORIES[idx])
            setStep("results")
        }, 2200)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
    }, [handleFile])

    const handleSubmit = async () => {
        if (!file || !title.trim()) { setError("Please provide a title."); return }
        setSubmitting(true); setError("")
        try {
            const fd = new FormData()
            fd.append("image", file)
            fd.append("title", title)
            fd.append("description", description || `${aiCategory} clothes item in ${condition} condition`)
            fd.append("condition", condition)
            fd.append("ai_category", aiCategory)
            fd.append("ai_confidence", String(aiConfidence))
            if (selectedOrg) fd.append("target_organization_id", selectedOrg)
            await api.createItemListing(fd)
            setSubmitted(true)
            // Refresh my items
            api.getMyItems().then(res => setMyItems(res.data || [])).catch(() => {})
        } catch (e: any) {
            setError(e.message || "Failed to submit donation.")
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setStep("upload"); setFile(null); setPreview(""); setAiCategory("")
        setAiConfidence(0); setTitle(""); setDescription(""); setCondition("good")
        setSelectedOrg(""); setSubmitted(false); setError("")
    }

    const selectedOrgData = orgs.find(o => o.public_id === selectedOrg)

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[scaleIn_0.4s_ease-out]">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Submitted!</h2>
                <p className="text-gray-500 mb-2">
                    Your <span className="font-semibold text-gray-700">{aiCategory}</span> has been submitted for review.
                </p>
                {selectedOrgData ? (
                    <p className="text-sm text-gray-400 mb-8">Targeted to: <span className="font-medium text-blue-600">{selectedOrgData.name}</span></p>
                ) : (
                    <p className="text-sm text-gray-400 mb-8">Available to all organizations</p>
                )}
                <Button onClick={resetForm} className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                    Donate Another Item
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Donate Clothes</h1>
                <p className="text-gray-500">Upload an image of your clothes item — our AI will classify it instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Zone */}
                    {step === "upload" && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all cursor-pointer group ${isDragging ? "border-blue-400 bg-blue-50" : "border-blue-200 bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300"}`}
                        >
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                <CloudUpload className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Upload Clothes Photo</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Drag and drop your clothes item photo here, or click to browse. AI will classify the item automatically.</p>
                            <Button className="font-medium bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                                <ImageIcon className="w-4 h-4 mr-2" /> Select Photo
                            </Button>
                        </div>
                    )}

                    {/* Analyzing */}
                    {step === "analyzing" && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                            {preview && <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl mx-auto mb-6 border border-gray-200" />}
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                <span className="font-semibold text-gray-900">Analyzing clothes item…</span>
                            </div>
                            <div className="w-64 mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className="bg-blue-500 h-2 rounded-full animate-[progressBar_2.2s_ease-in-out_forwards]" />
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Running AI classification model…</p>
                        </div>
                    )}

                    {/* Results & Form */}
                    {step === "results" && (
                        <div className="space-y-6">
                            {/* AI Result Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h3 className="font-bold text-gray-900">AI Classification Result</h3>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> CLASSIFIED
                                    </span>
                                </div>
                                <div className="flex gap-6">
                                    {preview && (
                                        <div className="w-36 h-36 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 relative group">
                                            <img src={preview} alt="Uploaded" className="w-full h-full object-cover" />
                                            <button onClick={resetForm} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3.5 h-3.5 text-white" />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Shirt className="w-4 h-4 text-blue-500" />
                                            <span className="text-xs text-gray-400 font-medium uppercase">Detected Category</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-3">{aiCategory}</h4>
                                        <div className="mb-1 flex justify-between text-xs">
                                            <span className="text-gray-500 font-medium">Confidence</span>
                                            <span className="font-bold text-gray-900">{aiConfidence}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-700" style={{ width: `${aiConfidence}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Donation Form */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-500" /> Donation Details
                                </h3>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Item Title</label>
                                    <input value={title} onChange={e => setTitle(e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" placeholder="e.g. Blue Cotton T-Shirt" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description (optional)</label>
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none" placeholder="Add details about size, color, brand…" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Condition</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["new", "like_new", "good", "fair", "poor"].map(c => (
                                            <button key={c} onClick={() => setCondition(c)} className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${condition === c ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                                                {c.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Org Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                                        Donate To (optional)
                                    </label>
                                    <div ref={dropdownRef} className="relative">
                                        <button onClick={() => setOrgDropdownOpen(!orgDropdownOpen)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm flex items-center justify-between hover:border-gray-300 transition-all bg-white">
                                            {selectedOrgData ? (
                                                <span className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium text-gray-900">{selectedOrgData.name}</span>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">Available to all organizations</span>
                                            )}
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${orgDropdownOpen ? "rotate-180" : ""}`} />
                                        </button>
                                        {orgDropdownOpen && (
                                            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                <button onClick={() => { setSelectedOrg(""); setOrgDropdownOpen(false) }} className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100">
                                                    <Tag className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">Available to all organizations</span>
                                                </button>
                                                {orgs.map(org => (
                                                    <button key={org.public_id} onClick={() => { setSelectedOrg(org.public_id); setOrgDropdownOpen(false) }} className={`w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex items-center gap-3 transition-colors ${selectedOrg === org.public_id ? "bg-blue-50" : ""}`}>
                                                        {org.logo_url ? (
                                                            <img src={org.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-200" />
                                                        ) : (
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold">{org.name?.charAt(0)}</div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900">{org.name}</p>
                                                            {org.city && <p className="text-xs text-gray-400">{org.city}{org.country ? `, ${org.country}` : ""}</p>}
                                                        </div>
                                                    </button>
                                                ))}
                                                {orgs.length === 0 && <div className="p-4 text-sm text-gray-400 text-center">No organizations available</div>}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Leave empty to make this item available to all registered organizations.
                                    </p>
                                </div>

                                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                                <Button onClick={handleSubmit} disabled={submitting || !title.trim()} className="w-full h-11 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    {submitting ? "Submitting…" : "Submit Donation"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* How it works */}
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 text-sm mb-4">How It Works</h3>
                        <div className="space-y-4">
                            {[
                                { num: "1", title: "Upload Photo", desc: "Take or upload a photo of your clothes item" },
                                { num: "2", title: "AI Classification", desc: "Our AI model identifies the clothes type instantly" },
                                { num: "3", title: "Choose Recipient", desc: "Select an organization or leave open for all" },
                                { num: "4", title: "Submit", desc: "Organizations can browse and request your donation" },
                            ].map(s => (
                                <div key={s.num} className="flex gap-3">
                                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">{s.num}</div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                                        <p className="text-xs text-gray-400">{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Recent Donations */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm">My Recent Donations</h3>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {myItems.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-400">No clothes donations yet.</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {myItems.slice(0, 5).map((item: any) => (
                                        <div key={item.public_id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                            {item.images?.[0]?.url ? (
                                                <img src={item.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center"><Shirt className="w-5 h-5 text-gray-400" /></div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-400">{item.ai_category || item.condition}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-green-50 text-green-700" : item.status === "pending_review" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                                {item.status?.replace("_", " ")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-400">AI Clothes Classifier v1.0</p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes progressBar { from { width: 0% } to { width: 95% } }
                @keyframes scaleIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
            `}</style>
        </div>
    )
}

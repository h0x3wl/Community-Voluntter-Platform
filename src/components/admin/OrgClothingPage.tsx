import { useState, useEffect } from "react"
import { api } from "../../lib/api"
import { Button } from "../ui/button"
import {
    Package,
    Shirt,
    Search,
    Filter,
    Warehouse,
    CheckCircle2,
    Truck,
    Clock,
    Loader2,
    Eye,
    X,
    ChevronDown,
    BarChart3,
    ArrowRight,
    XCircle
} from "lucide-react"

type Tab = "browse" | "storage" | "delivered"

export function OrgClothingPage() {
    const [tab, setTab] = useState<Tab>("browse")
    const [items, setItems] = useState<any[]>([])
    const [storageItems, setStorageItems] = useState<any[]>([])
    const [storageSummary, setStorageSummary] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [filterOpen, setFilterOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [requesting, setRequesting] = useState<string | null>(null)
    const [orgId, setOrgId] = useState("")

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            try {
                const u = JSON.parse(userData)
                if (u.org_public_id) {
                    setOrgId(u.org_public_id)
                    loadData(u.org_public_id)
                }
            } catch {}
        }
    }, [])

    const loadData = async (oid: string) => {
        setLoading(true)
        try {
            const [availRes, storRes] = await Promise.all([
                api.getOrgAvailableItems(oid),
                api.getOrgStorage(oid),
            ])
            setItems(availRes.data || [])
            setStorageItems(storRes.data || [])
            setStorageSummary(storRes.meta?.summary || null)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleRequest = async (itemPublicId: string) => {
        if (!orgId) return
        setRequesting(itemPublicId)
        try {
            await api.requestItem(itemPublicId, orgId)
            // Refresh and switch to storage tab
            await loadData(orgId)
            setTab("storage")
        } catch (e: any) {
            alert(e.message || "Failed to take item")
        } finally {
            setRequesting(null)
        }
    }

    const [delivering, setDelivering] = useState<string | null>(null)

    const handleDeliver = async (requestPublicId: string) => {
        if (!orgId) return
        setDelivering(requestPublicId)
        try {
            await api.markItemDelivered(orgId, requestPublicId)
            await loadData(orgId)
            setTab("delivered")
        } catch (e: any) {
            alert(e.message || "Failed to mark as delivered")
        } finally {
            setDelivering(null)
        }
    }

    const categories = Array.from(new Set(items.map(i => i.ai_category).filter(Boolean)))

    const filteredItems = items.filter(item => {
        const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || item.ai_category?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = !categoryFilter || item.ai_category === categoryFilter
        return matchSearch && matchCat
    })

    const filteredStorage = storageItems.filter(item => {
        const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchSearch && item.request_status === 'accepted'
    })

    const filteredDelivered = storageItems.filter(item => {
        const matchSearch = !searchQuery || item.title?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchSearch && item.request_status === 'delivered'
    })

    const acceptedCount = storageItems.filter(i => i.request_status === 'accepted').length
    const deliveredCount = storageItems.filter(i => i.request_status === 'delivered').length

    const conditionColor = (c: string) => {
        switch (c) {
            case "new": return "bg-emerald-50 text-emerald-700 border-emerald-100"
            case "like_new": return "bg-blue-50 text-blue-700 border-blue-100"
            case "good": return "bg-sky-50 text-sky-700 border-sky-100"
            case "fair": return "bg-amber-50 text-amber-700 border-amber-100"
            case "poor": return "bg-red-50 text-red-700 border-red-100"
            default: return "bg-gray-50 text-gray-700 border-gray-100"
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <div className="w-8 h-8 rounded-full border-4 border-t-green-500 border-green-500/20 animate-spin" />
                    <p>Loading clothes inventory…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Clothes Donations</h1>
                    <p className="text-gray-500 text-sm">Browse available donations and manage your clothes storage.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                <button onClick={() => { setTab("browse"); setSearchQuery(""); setCategoryFilter("") }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab === "browse" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    <Package className="w-4 h-4" /> Browse Items
                    <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{items.length}</span>
                </button>
                <button onClick={() => { setTab("storage"); setSearchQuery(""); setCategoryFilter("") }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab === "storage" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    <Warehouse className="w-4 h-4" /> Storage
                    <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">{acceptedCount}</span>
                </button>
                <button onClick={() => { setTab("delivered"); setSearchQuery(""); setCategoryFilter("") }} className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${tab === "delivered" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                    <Truck className="w-4 h-4" /> Delivered
                    <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">{deliveredCount}</span>
                </button>
            </div>

            {/* Storage Summary Cards (only in storage tab) */}
            {tab === "storage" && storageSummary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Accepted</p>
                                <p className="text-2xl font-bold text-gray-900">{storageSummary.total_accepted}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">{storageSummary.total_delivered}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Warehouse className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase">Total In Storage</p>
                                <p className="text-2xl font-bold text-gray-900">{storageSummary.total_in_storage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Category breakdown in storage */}
            {tab === "storage" && storageSummary?.categories && Object.keys(storageSummary.categories).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" /> Storage by Category
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(storageSummary.categories).map(([cat, count]: [string, any]) => (
                            <div key={cat} className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2">
                                <Shirt className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">{cat}</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search clothes items…" className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white transition-all" />
                </div>
                {tab === "browse" && categories.length > 0 && (
                    <div className="relative">
                        <button onClick={() => setFilterOpen(!filterOpen)} className="h-10 px-4 border border-gray-200 rounded-lg text-sm flex items-center gap-2 hover:border-gray-300 bg-white transition-all">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">{categoryFilter || "All Categories"}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        {filterOpen && (
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                <button onClick={() => { setCategoryFilter(""); setFilterOpen(false) }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 text-gray-600">All Categories</button>
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => { setCategoryFilter(cat); setFilterOpen(false) }} className={`w-full px-4 py-2.5 text-left text-sm hover:bg-blue-50 ${categoryFilter === cat ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Items Grid */}
            {tab === "browse" && (
                <>
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">No items available</h3>
                            <p className="text-sm text-gray-500">Check back later for new clothes donations.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map((item: any) => (
                                <div key={item.public_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                                        {item.images?.[0]?.url ? (
                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Shirt className="w-12 h-12 text-gray-300" /></div>
                                        )}
                                        {item.ai_category && (
                                            <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold text-gray-700 border border-gray-200">
                                                {item.ai_category}
                                            </span>
                                        )}

                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
                                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${conditionColor(item.condition)}`}>
                                                {item.condition?.replace("_", " ")}
                                            </span>
                                            {item.donor && <span className="text-xs text-gray-400">by {item.donor.name}</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedItem(item)} className="flex-1 h-9 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <button onClick={() => handleRequest(item.public_id)} disabled={requesting === item.public_id} className="flex-1 h-9 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
                                                {requesting === item.public_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                                Take
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Storage Grid */}
            {tab === "storage" && (
                <>
                    {filteredStorage.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Warehouse className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Storage is empty</h3>
                            <p className="text-sm text-gray-500">Take items from the Browse tab to add them to your storage.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStorage.map((item: any) => (
                                <div key={item.public_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="relative h-36 bg-gray-100 overflow-hidden">
                                        {item.images?.[0]?.url ? (
                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Shirt className="w-10 h-10 text-gray-300" /></div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            {item.ai_category && <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">{item.ai_category}</span>}
                                            <span className={`px-2 py-0.5 rounded-full border ${conditionColor(item.condition)}`}>
                                                {item.condition?.replace("_", " ")}
                                            </span>
                                            {item.target_organization && (
                                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">For you</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeliver(item.request_public_id)}
                                            disabled={delivering === item.request_public_id}
                                            className="w-full h-9 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                                        >
                                            {delivering === item.request_public_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                                            Mark as Delivered
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Delivered Grid */}
            {tab === "delivered" && (
                <>
                    {filteredDelivered.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">No delivered items yet</h3>
                            <p className="text-sm text-gray-500">Mark items as delivered from the Storage tab.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDelivered.map((item: any) => (
                                <div key={item.public_id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="relative h-36 bg-gray-100 overflow-hidden">
                                        {item.images?.[0]?.url ? (
                                            <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center"><Shirt className="w-10 h-10 text-gray-300" /></div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                            {item.ai_category && <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">{item.ai_category}</span>}
                                            <span className={`px-2 py-0.5 rounded-full border ${conditionColor(item.condition)}`}>
                                                {item.condition?.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Item Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="relative">
                            {selectedItem.images?.[0]?.url ? (
                                <img src={selectedItem.images[0].url} alt={selectedItem.title} className="w-full h-56 object-cover rounded-t-2xl" />
                            ) : (
                                <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-t-2xl"><Shirt className="w-16 h-16 text-gray-300" /></div>
                            )}
                            <button onClick={() => setSelectedItem(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedItem.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{selectedItem.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p>
                                    <p className="text-sm font-semibold text-gray-900">{selectedItem.ai_category || "Unknown"}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Condition</p>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{selectedItem.condition?.replace("_", " ")}</p>
                                </div>
                                {selectedItem.ai_confidence && (
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">AI Confidence</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedItem.ai_confidence}%</p>
                                    </div>
                                )}
                                {selectedItem.donor && (
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Donor</p>
                                        <p className="text-sm font-semibold text-gray-900">{selectedItem.donor.name}</p>
                                    </div>
                                )}
                            </div>
                            {selectedItem.created_at && (
                                <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Listed {new Date(selectedItem.created_at).toLocaleDateString()}</p>
                            )}
                            <Button onClick={() => { handleRequest(selectedItem.public_id); setSelectedItem(null) }} className="w-full h-11 bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg shadow-green-500/20">
                                <ArrowRight className="w-4 h-4 mr-2" /> Take This Item
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

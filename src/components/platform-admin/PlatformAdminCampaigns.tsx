import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Search,
    CheckCircle2,
    XCircle,
    Trash2,
    Edit2,
    X
} from "lucide-react"

export function PlatformAdminCampaigns() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [editingCampaign, setEditingCampaign] = useState<any | null>(null)
    const [editForm, setEditForm] = useState({ title: "", description: "", goal_cents: 0, status: "" })

    const fetchCampaigns = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (statusFilter) params.set("status", statusFilter)
            if (searchQuery) params.set("q", searchQuery)
            const res = await api.getAdminCampaigns(params.toString())
            setCampaigns(res.data || [])
        } catch (err) {
            console.error("Failed to fetch campaigns", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchCampaigns() }, [statusFilter])

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchCampaigns() }

    const handleApprove = async (id: string) => {
        try { await api.approveAdminCampaign(id); fetchCampaigns() } catch (err: any) { alert(`Error: ${err.message}`) }
    }
    const handleReject = async (id: string) => {
        if (!confirm("Reject this campaign?")) return
        try { await api.rejectAdminCampaign(id); fetchCampaigns() } catch (err: any) { alert(`Error: ${err.message}`) }
    }
    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this campaign?")) return
        try { await api.deleteAdminCampaign(id); fetchCampaigns() } catch (err: any) { alert(`Error: ${err.message}`) }
    }

    const openEdit = (camp: any) => {
        setEditingCampaign(camp)
        setEditForm({ title: camp.title || "", description: camp.description || "", goal_cents: camp.goal_cents || 0, status: camp.status || "active" })
    }

    const handleSaveEdit = async () => {
        if (!editingCampaign) return
        try { await api.updateAdminCampaign(editingCampaign.public_id, editForm); setEditingCampaign(null); fetchCampaigns() }
        catch (err: any) { alert(`Error: ${err.message}`) }
    }

    const statusColors: Record<string, string> = {
        active: "bg-green-100 text-green-700",
        pending_review: "bg-amber-100 text-amber-700",
        paused: "bg-gray-100 text-gray-600",
        rejected: "bg-red-100 text-red-700",
        completed: "bg-blue-100 text-blue-700",
    }

    const statuses = ["", "active", "pending_review", "paused", "completed", "rejected"]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">All Campaigns</h1>
                <p className="text-gray-500 mt-1">Review, approve, edit, or remove any campaign on the platform.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search campaigns by title..." className="pl-9 h-10 bg-white border-gray-200 rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </form>
                <div className="flex gap-2 flex-wrap">
                    {statuses.map((s) => (
                        <button key={s || "all"} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${statusFilter === s ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
                        >
                            {s ? s.replace("_", " ") : "All"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20"><span className="text-gray-400">Loading...</span></div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No campaigns found.</div>
                ) : (
                    <>
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                            <span className="col-span-4">Campaign</span>
                            <span className="col-span-2">Organization</span>
                            <span className="col-span-1">Status</span>
                            <span className="col-span-2">Progress</span>
                            <span className="col-span-3 text-right">Actions</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {campaigns.map((camp: any, i: number) => {
                                const raised = (camp.raised_cents || 0) / 100
                                const goal = (camp.goal_cents || 1) / 100
                                const progress = Math.min((raised / goal) * 100, 100)
                                const status = camp.status || "active"
                                return (
                                    <div key={camp.public_id || i} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {camp.title?.charAt(0) || "C"}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">{camp.title}</h4>
                                                <p className="text-xs text-gray-400 truncate">{camp.description?.slice(0, 60)}...</p>
                                            </div>
                                        </div>
                                        <div className="col-span-2 text-xs text-gray-500">{camp.organization?.name || "—"}</div>
                                        <div className="col-span-1">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${statusColors[status] || statusColors.active}`}>
                                                {status.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="flex justify-between text-[10px] font-bold mb-1">
                                                <span className="text-gray-700">${raised.toLocaleString()}</span>
                                                <span className="text-gray-400">${goal.toLocaleString()}</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex justify-end gap-2">
                                            {status === "pending_review" && (
                                                <>
                                                    <button onClick={() => handleApprove(camp.public_id)} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                                                    <button onClick={() => handleReject(camp.public_id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                                                </>
                                            )}
                                            <button onClick={() => openEdit(camp)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(camp.public_id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Edit Modal */}
            {editingCampaign && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Edit Campaign</h2>
                            <button onClick={() => setEditingCampaign(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea className="w-full h-24 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Goal (cents)</label>
                                    <Input type="number" value={editForm.goal_cents} onChange={(e) => setEditForm({ ...editForm, goal_cents: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <select className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="pending_review">Pending Review</option>
                                        <option value="paused">Paused</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => setEditingCampaign(null)}>Cancel</Button>
                                <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Search,
    Trash2,
    Edit2,
    X,
    Globe,
    MapPin,
    Users,
    CheckCircle
} from "lucide-react"

export function PlatformAdminOrganizations() {
    const [organizations, setOrganizations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingOrg, setEditingOrg] = useState<any | null>(null)
    const [editForm, setEditForm] = useState({ name: "", description: "", status: "", website: "", city: "" })

    const fetchOrgs = async () => {
        setIsLoading(true)
        try {
            const params = searchQuery ? `q=${searchQuery}` : ""
            const res = await api.getAdminOrganizations(params)
            setOrganizations(res.data || [])
        } catch (err) {
            console.error("Failed to fetch organizations", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchOrgs() }, [])

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchOrgs() }

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this organization and all its data?")) return
        try { await api.deleteAdminOrganization(id); fetchOrgs() } catch (err: any) { alert(`Error: ${err.message}`) }
    }

    const openEdit = (org: any) => {
        setEditingOrg(org)
        setEditForm({ name: org.name || "", description: org.description || "", status: org.status || "approved", website: org.website || "", city: org.city || "" })
    }

    const handleSaveEdit = async () => {
        if (!editingOrg) return
        try { await api.updateAdminOrganization(editingOrg.public_id, editForm); setEditingOrg(null); fetchOrgs() }
        catch (err: any) { alert(`Error: ${err.message}`) }
    }

    const statusColors: Record<string, string> = {
        approved: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        suspended: "bg-red-100 text-red-700",
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                <p className="text-gray-500 mt-1">Manage all registered organizations on the platform.</p>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search organizations..." className="pl-9 h-10 bg-white border-gray-200 rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-20"><span className="text-gray-400">Loading...</span></div>
                ) : organizations.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400">No organizations found.</div>
                ) : (
                    organizations.map((org: any, i: number) => (
                        <div key={org.public_id || i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {org.logo_url ? (
                                        <img src={org.logo_url} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt={org.name} />
                                    ) : (
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg">
                                            {org.name?.charAt(0) || "O"}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900">{org.name}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[org.status] || statusColors.approved}`}>
                                            {org.status || "approved"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 line-clamp-2">{org.description || "No description."}</p>
                            <div className="space-y-2 mb-4">
                                {org.city && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <MapPin className="w-3 h-3" /> {org.city}{org.country ? `, ${org.country}` : ""}
                                    </div>
                                )}
                                {org.website && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Globe className="w-3 h-3" />
                                        <a href={org.website} target="_blank" rel="noopener" className="hover:text-indigo-600 truncate">{org.website}</a>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {org.members_count || 0} members</span>
                                    <span>{org.campaigns_count || 0} campaigns</span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                                {org.status === 'pending' && (
                                    <button onClick={() => api.updateAdminOrganization(org.public_id, { status: 'approved' }).then(fetchOrgs)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                    </button>
                                )}
                                <button onClick={() => openEdit(org)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-bold">
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button onClick={() => handleDelete(org.public_id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-bold">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-bold text-gray-900">Edit Organization</h2>
                            <button onClick={() => setEditingOrg(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea className="w-full h-20 border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                                    <select className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                        <option value="approved">Approved</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                                    <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Website</label>
                                <Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} />
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                <Button variant="ghost" onClick={() => setEditingOrg(null)}>Cancel</Button>
                                <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

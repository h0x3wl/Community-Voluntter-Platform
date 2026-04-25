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
    CheckCircle,
    FileText,
    UserCheck,
    Shield,
    ExternalLink,
    Download,
    Eye,
    Building2,
    Hash,
    BadgeCheck
} from "lucide-react"

export function PlatformAdminOrganizations() {
    const [organizations, setOrganizations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [editingOrg, setEditingOrg] = useState<any | null>(null)
    const [editForm, setEditForm] = useState({
        name: "", description: "", status: "", website: "", phone: "", city: "", country: "",
        org_type: "", tax_id: "", license_number: "", authorized_rep_name: "", authorized_rep_id: ""
    })
    const [reviewingOrg, setReviewingOrg] = useState<any | null>(null)

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
        setEditForm({
            name: org.name || "", description: org.description || "", status: org.status || "approved",
            website: org.website || "", phone: org.phone || "", city: org.city || "", country: org.country || "",
            org_type: org.org_type || "", tax_id: org.tax_id || "", license_number: org.license_number || "",
            authorized_rep_name: org.authorized_rep_name || "", authorized_rep_id: org.authorized_rep_id || ""
        })
    }

    const handleSaveEdit = async () => {
        if (!editingOrg) return
        try { await api.updateAdminOrganization(editingOrg.public_id, editForm); setEditingOrg(null); fetchOrgs() }
        catch (err: any) { alert(`Error: ${err.message}`) }
    }

    const handleApprove = async (org: any) => {
        try {
            await api.updateAdminOrganization(org.public_id, { status: 'approved' })
            fetchOrgs()
            if (reviewingOrg?.public_id === org.public_id) {
                setReviewingOrg({ ...reviewingOrg, status: 'approved' })
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`)
        }
    }

    const statusColors: Record<string, string> = {
        approved: "bg-green-100 text-green-700",
        pending: "bg-amber-100 text-amber-700",
        suspended: "bg-red-100 text-red-700",
    }

    const orgTypeLabels: Record<string, string> = {
        ngo: "NGO",
        foundation: "Foundation",
        social_enterprise: "Social Enterprise",
        cooperative: "Cooperative",
        charity: "Charity",
        other: "Other",
    }

    const hasLegalInfo = (org: any) => org.authorized_rep_name || org.authorized_rep_id || org.legal_document || org.tax_id || org.license_number

    // Check if a legal document URL points to an image
    const isImageDoc = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url)

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
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[org.status] || statusColors.approved}`}>
                                                {org.status || "approved"}
                                            </span>
                                            {org.org_type && (
                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                                    {orgTypeLabels[org.org_type] || org.org_type}
                                                </span>
                                            )}
                                        </div>
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
                                    <button onClick={() => handleApprove(org)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                    </button>
                                )}
                                <button onClick={() => setReviewingOrg(org)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-bold">
                                    <Eye className="w-3.5 h-3.5" /> Review
                                </button>
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

            {/* Review / Legal Details Modal */}
            {reviewingOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Organization Review</h2>
                                    <p className="text-xs text-gray-500">{reviewingOrg.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setReviewingOrg(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Status Banner */}
                            <div className={`flex items-center gap-3 p-4 rounded-xl ${
                                reviewingOrg.status === 'pending' ? 'bg-amber-50 border border-amber-200' :
                                reviewingOrg.status === 'approved' ? 'bg-green-50 border border-green-200' :
                                'bg-red-50 border border-red-200'
                            }`}>
                                <CheckCircle className={`w-5 h-5 ${
                                    reviewingOrg.status === 'pending' ? 'text-amber-500' :
                                    reviewingOrg.status === 'approved' ? 'text-green-500' :
                                    'text-red-500'
                                }`} />
                                <div>
                                    <p className={`text-sm font-bold ${
                                        reviewingOrg.status === 'pending' ? 'text-amber-800' :
                                        reviewingOrg.status === 'approved' ? 'text-green-800' :
                                        'text-red-800'
                                    }`}>
                                        Status: {reviewingOrg.status?.charAt(0).toUpperCase() + reviewingOrg.status?.slice(1)}
                                    </p>
                                    <p className={`text-xs ${
                                        reviewingOrg.status === 'pending' ? 'text-amber-600' :
                                        reviewingOrg.status === 'approved' ? 'text-green-600' :
                                        'text-red-600'
                                    }`}>
                                        {reviewingOrg.status === 'pending' ? 'This organization is awaiting approval.' :
                                         reviewingOrg.status === 'approved' ? 'This organization has been approved.' :
                                         'This organization is currently suspended.'}
                                    </p>
                                </div>
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Organization Name" value={reviewingOrg.name} />
                                    <InfoItem label="Type" value={reviewingOrg.org_type ? (orgTypeLabels[reviewingOrg.org_type] || reviewingOrg.org_type) : "—"} />
                                    <InfoItem label="City" value={reviewingOrg.city || "—"} />
                                    <InfoItem label="Country" value={reviewingOrg.country || "—"} />
                                    <InfoItem label="Phone" value={reviewingOrg.phone || "—"} />
                                    <InfoItem label="Website" value={reviewingOrg.website} isLink />
                                </div>
                            </div>

                            {/* Registration & Verification */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    Registration & Verification
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="Tax ID / Reg. Number" value={reviewingOrg.tax_id || "—"} />
                                    <InfoItem label="License Number" value={reviewingOrg.license_number || "—"} />
                                </div>
                            </div>

                            {/* Authorized Representative */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                    Authorized Representative
                                </h3>
                                {reviewingOrg.authorized_rep_name || reviewingOrg.authorized_rep_id ? (
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoItem label="Full Name" value={reviewingOrg.authorized_rep_name || "—"} />
                                            <InfoItem label="National / Passport ID" value={reviewingOrg.authorized_rep_id || "—"} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">No authorized representative information provided.</p>
                                )}
                            </div>

                            {/* Legal Documentation */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Legal Documentation
                                </h3>
                                {reviewingOrg.legal_document ? (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        {/* Preview area */}
                                        {isImageDoc(reviewingOrg.legal_document) ? (
                                            <div className="bg-slate-50 p-4 flex items-center justify-center max-h-80 overflow-hidden">
                                                <img
                                                    src={reviewingOrg.legal_document}
                                                    alt="Legal document"
                                                    className="max-h-72 object-contain rounded-lg shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-8 flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-700">Legal Document</p>
                                                <p className="text-xs text-gray-400">
                                                    {reviewingOrg.legal_document.split('/').pop()}
                                                </p>
                                            </div>
                                        )}
                                        {/* Action bar */}
                                        <div className="flex items-center gap-2 p-3 bg-white border-t border-slate-200">
                                            <a
                                                href={reviewingOrg.legal_document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-bold"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View Full Document
                                            </a>
                                            <a
                                                href={reviewingOrg.legal_document}
                                                download
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold"
                                            >
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2">
                                        <FileText className="w-8 h-8 text-gray-300" />
                                        <p className="text-xs text-gray-400 italic">No legal documentation uploaded.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30 flex-shrink-0">
                            <Button variant="ghost" onClick={() => setReviewingOrg(null)}>Close</Button>
                            <div className="flex gap-2">
                                {reviewingOrg.status === 'pending' && (
                                    <Button
                                        onClick={() => handleApprove(reviewingOrg)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Approve Organization
                                    </Button>
                                )}
                                {reviewingOrg.status === 'approved' && (
                                    <span className="flex items-center gap-2 text-sm font-medium text-green-600 px-3">
                                        <BadgeCheck className="w-4 h-4" /> Approved
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal — same layout as Review but with editable fields */}
            {editingOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <Edit2 className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Edit Organization</h2>
                                    <p className="text-xs text-gray-500">{editingOrg.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingOrg(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            {/* Status */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-gray-400" />
                                    Status
                                </h3>
                                <select
                                    className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                >
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-gray-400" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Organization Name</label>
                                        <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Type</label>
                                        <select
                                            className="w-full h-10 border border-gray-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            value={editForm.org_type}
                                            onChange={(e) => setEditForm({ ...editForm, org_type: e.target.value })}
                                        >
                                            <option value="">Select type...</option>
                                            <option value="ngo">NGO</option>
                                            <option value="foundation">Foundation</option>
                                            <option value="social_enterprise">Social Enterprise</option>
                                            <option value="cooperative">Cooperative</option>
                                            <option value="charity">Charity</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">City</label>
                                        <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Country</label>
                                        <Input value={editForm.country} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Phone</label>
                                        <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Website</label>
                                        <Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Description</label>
                                    <textarea
                                        className="w-full h-20 border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Registration & Verification */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-gray-400" />
                                    Registration & Verification
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Tax ID / Reg. Number</label>
                                        <Input value={editForm.tax_id} onChange={(e) => setEditForm({ ...editForm, tax_id: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">License Number</label>
                                        <Input value={editForm.license_number} onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })} className="h-10 rounded-xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Authorized Representative */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-gray-400" />
                                    Authorized Representative
                                </h3>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Full Name</label>
                                            <Input value={editForm.authorized_rep_name} onChange={(e) => setEditForm({ ...editForm, authorized_rep_name: e.target.value })} className="h-10 rounded-xl bg-white" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">National / Passport ID</label>
                                            <Input value={editForm.authorized_rep_id} onChange={(e) => setEditForm({ ...editForm, authorized_rep_id: e.target.value })} className="h-10 rounded-xl bg-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Legal Documentation (read-only preview) */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Legal Documentation
                                </h3>
                                {editingOrg.legal_document ? (
                                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                                        {isImageDoc(editingOrg.legal_document) ? (
                                            <div className="bg-slate-50 p-4 flex items-center justify-center max-h-80 overflow-hidden">
                                                <img
                                                    src={editingOrg.legal_document}
                                                    alt="Legal document"
                                                    className="max-h-72 object-contain rounded-lg shadow-sm"
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-8 flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                                                    <FileText className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-700">Legal Document</p>
                                                <p className="text-xs text-gray-400">
                                                    {editingOrg.legal_document.split('/').pop()}
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 p-3 bg-white border-t border-slate-200">
                                            <a
                                                href={editingOrg.legal_document}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-bold"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> View Full Document
                                            </a>
                                            <a
                                                href={editingOrg.legal_document}
                                                download
                                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-xs font-bold"
                                            >
                                                <Download className="w-3.5 h-3.5" /> Download
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2">
                                        <FileText className="w-8 h-8 text-gray-300" />
                                        <p className="text-xs text-gray-400 italic">No legal documentation uploaded.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/30 flex-shrink-0">
                            <Button variant="ghost" onClick={() => setEditingOrg(null)}>Cancel</Button>
                            <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

/** Small reusable info display component */
function InfoItem({ label, value, isLink }: { label: string; value?: string | null; isLink?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            {isLink && value ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                    {value}
                </a>
            ) : (
                <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
            )}
        </div>
    )
}

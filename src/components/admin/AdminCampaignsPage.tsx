import { useEffect, useState, useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Search,
    Filter,
    Plus,
    Calendar,
    Users,
    Flag,
    X,
    CheckCircle2,
    Image as ImageIcon,
    Edit2,
    Trash2
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

export function AdminCampaignsPage() {
    const { orgId } = useCurrentUser()
    const [filterActive, setFilterActive] = useState(false)
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [overview, setOverview] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    
    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [wizardStatus, setWizardStatus] = useState<"idle" | "submitting" | "success">("idle")
    const [editingCampaign, setEditingCampaign] = useState<any>(null)
    const [campaignImageFile, setCampaignImageFile] = useState<File | null>(null)
    const campaignImageRef = useRef<HTMLInputElement>(null)

    const fetchAll = async () => {
        try {
            const [campRes, overRes] = await Promise.all([
                api.getOrgCampaigns(orgId).catch(() => null),
                api.getOrgOverview(orgId).catch(() => null)
            ])
            if (campRes?.data) setCampaigns(campRes.data)
            if (overRes?.data) setOverview(overRes.data)
        } catch (err) {
            console.error("Failed to fetch campaigns page data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!orgId) return
        fetchAll()
    }, [orgId])

    const handleCreateOrEditCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        const formData = new FormData(e.currentTarget)
        const campaignData = {
            title: formData.get("title") || "New Campaign",
            description: formData.get("description"),
            goal_cents: parseInt((formData.get("goal") as string) || "50000") * 100,
            is_urgent: formData.get("is_urgent") === "on",
        }

        setWizardStatus("submitting")
        try {
            let createdCampaign: any = null;
            if (editingCampaign) {
                await api.updateOrgCampaign(orgId, editingCampaign.public_id, campaignData);
                createdCampaign = editingCampaign;
            } else {
                const res = await api.createOrgCampaign(orgId, campaignData);
                createdCampaign = res?.data;
            }

            // Upload image if one was selected
            if (campaignImageFile && createdCampaign?.public_id) {
                const imgForm = new FormData();
                imgForm.append('image', campaignImageFile);
                await api.uploadCampaignImage(orgId, createdCampaign.public_id, imgForm).catch(e => console.error('Image upload failed:', e));
            }
            
            // Re-fetch everything to show accurate DB changes
            await fetchAll()
            
            setWizardStatus("success")
            setTimeout(() => {
                setIsWizardOpen(false)
                setWizardStatus("idle")
                setEditingCampaign(null)
                setCampaignImageFile(null)
                if (campaignImageRef.current) campaignImageRef.current.value = '';
            }, 1500)
        } catch (error: any) {
            console.error("Failed to save campaign:", error)
            const validationErrors = error.errors ? "\nDetails: " + JSON.stringify(error.errors) : "";
            alert(`Error: ${error.message}${validationErrors}`)
            setWizardStatus("idle")
        }
    }

    const handleDelete = async (campaignId: string) => {
        if(confirm("Are you sure you want to remove this campaign? This action permanently deletes it.")) {
            try {
                await api.deleteOrgCampaign(orgId, campaignId);
                // Refresh list
                await fetchAll();
            } catch (error) {
                console.error("Failed to delete campaign:", error)
                alert("An error occurred while deleting the campaign.")
            }
        }
    }

    const openWizardForEdit = (campaign: any) => {
        setEditingCampaign(campaign)
        setIsWizardOpen(true)
    }

    const openWizardForCreate = () => {
        setEditingCampaign(null)
        setIsWizardOpen(true)
    }

    const activeCount = overview?.total_active_campaigns || campaigns.filter((c: any) => c.status === 'active').length || 0;
    const fundsRaised = (overview?.funds_raised_month || 0) / 100;
    const activeDonors = overview?.active_donors || 0;

    return (
        <div className="space-y-8 relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <span className="text-gray-500 font-medium">Loading manager...</span>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Campaigns Manager</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search campaigns, tags, or IDs..."
                        className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white transition-all rounded-lg"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                        <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-gray-200 text-gray-500">
                            <span className="sr-only">Notifications</span>
                            <div className="w-4 h-4 relative">
                                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                            </div>
                        </Button>
                        <Button variant="outline" className="w-10 h-10 p-0 rounded-full border-gray-200 text-gray-500">
                            <span className="sr-only">Settings</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                        </Button>
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                            <img src="https://i.pravatar.cc/100?img=12" alt="Admin" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Active Campaigns</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{activeCount}</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            Live
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Funds Raised (Month)</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">${fundsRaised.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            This month
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-sm font-medium text-gray-500 mb-1">Active Donors</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-gray-900">{activeDonors.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-green-600 flex items-center">
                            Growing
                        </span>
                    </div>
                </div>
            </div>

            {/* Active Campaigns Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Active Campaigns</h2>
                        <p className="text-sm text-gray-500">Review and manage your current fundraising initiatives</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className={`bg-white border-gray-200 text-gray-700 ${filterActive ? 'bg-blue-50 border-blue-200 text-blue-600' : ''}`}
                                onClick={() => setFilterActive(!filterActive)}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filter {filterActive && "(Active)"}
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                onClick={openWizardForCreate}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Campaign
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {campaigns.map((camp, i) => {
                        const raised = (camp.raised_cents || 0) / 100
                        const goal = (camp.goal_cents || 1) / 100
                        const progress = Math.min((raised / goal) * 100, 100)
                        
                        // Style map
                        const statusColors: any = {
                            'active': 'bg-green-500 text-white',
                            'pending_review': 'bg-amber-500 text-white',
                            'paused': 'bg-yellow-500 text-white',
                            'completed': 'bg-blue-500 text-white',
                            'rejected': 'bg-red-500 text-white',
                        }
                        const badgeColor = statusColors[camp.status] || 'bg-gray-500 text-white'
                        const barColor = camp.status === 'paused' ? 'bg-yellow-500' : camp.status === 'completed' ? 'bg-blue-500' : 'bg-green-500'
                        
                        return (
                            <div key={camp.public_id || i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                                <div className="h-40 relative overflow-hidden bg-gray-100 flex items-center justify-center">
                                    <img
                                        src={camp.image_url || `https://picsum.photos/seed/${camp.public_id || i}/400/300`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        alt={camp.title}
                                    />
                                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide shadow-sm ${badgeColor}`}>
                                        {camp.status || "active"}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <h3 className="font-bold text-gray-900 line-clamp-1 flex-1" title={camp.title}>{camp.title}</h3>
                                        <div className="flex gap-1">
                                            <button 
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                title="Edit"
                                                onClick={() => openWizardForEdit(camp)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                title="Remove"
                                                onClick={() => handleDelete(camp.public_id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                        {camp.description || "A fundraising initiative directed towards our core mission."}
                                    </p>

                                    <div className="mt-auto">
                                        <div className="flex justify-between text-xs font-bold mb-1.5">
                                            <span className="text-gray-900">${raised.toLocaleString()} raised</span>
                                            <span className="text-gray-400">Goal: ${goal.toLocaleString()}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                                            <div className={`h-full ${barColor}`} style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-50 pt-3">
                                            <span className="flex items-center gap-1">
                                                {camp.status === 'active' ? <Calendar className="w-3 h-3" /> : <Flag className="w-3 h-3" />} 
                                                {camp.days_left ? `${camp.days_left} days left` : camp.status}
                                            </span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {camp.donors_count || 0} donors</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* New Campaign Placeholder */}
                    <div
                        className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 hover:bg-gray-100 transition-colors cursor-pointer group h-full min-h-[300px]"
                        onClick={openWizardForCreate}
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-gray-900">New Campaign</h3>
                        <p className="text-xs text-gray-500 text-center mt-2 max-w-[150px]">
                            Launch a new fundraising initiative
                        </p>
                    </div>

                </div>
            </div>

            {/* Create / Edit Campaign Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in-95 duration-200">
                        {wizardStatus === "success" ? (
                            <div className="p-16 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {editingCampaign ? "Campaign Updated!" : "Campaign Submitted!"}
                                </h2>
                                <p className="text-gray-500 mt-3 max-w-sm">
                                    {editingCampaign 
                                        ? "Your changes have been saved successfully."
                                        : "Your campaign has been submitted for review. The platform admin will approve it shortly."
                                    }
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
                                    </h2>
                                    <button onClick={() => setIsWizardOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateOrEditCampaign} className="p-6 space-y-6">
                                    {/* Cover Image Upload */}
                                    <input
                                        type="file"
                                        ref={campaignImageRef}
                                        accept="image/png, image/jpeg, image/webp"
                                        className="hidden"
                                        onChange={(e) => setCampaignImageFile(e.target.files?.[0] || null)}
                                    />
                                    <div
                                        className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden"
                                        onClick={() => campaignImageRef.current?.click()}
                                    >
                                        {campaignImageFile ? (
                                            <div className="flex flex-col items-center">
                                                <img src={URL.createObjectURL(campaignImageFile)} alt="Preview" className="w-full h-32 object-cover rounded-lg opacity-90" />
                                                <span className="text-xs text-green-600 font-semibold mt-1">{campaignImageFile.name}</span>
                                            </div>
                                        ) : editingCampaign?.image_url ? (
                                            <img src={editingCampaign.image_url} alt="Cover" className="w-full h-full object-cover opacity-80 mix-blend-multiply" />
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-sm font-medium">Upload Cover Image</span>
                                                <span className="text-xs opacity-75 mt-1">Recommended: 1200x630px JPG/PNG</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Campaign Title</label>
                                        <Input name="title" required defaultValue={editingCampaign?.title || ""} placeholder="e.g. Clean Water Initiative 2026" className="text-lg font-medium" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Brief Description</label>
                                        <textarea 
                                            name="description"
                                            required 
                                            defaultValue={editingCampaign?.description || ""}
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="What is the goal of this initiative? How will the funds be used?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Financial Goal ($)</label>
                                            <Input name="goal" required min="100" defaultValue={editingCampaign ? editingCampaign.goal_cents / 100 : ""} type="number" placeholder="50000" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Target End Date</label>
                                            <Input required type="date" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            name="is_urgent" 
                                            id="is_urgent" 
                                            defaultChecked={editingCampaign?.is_urgent}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        />
                                        <label htmlFor="is_urgent" className="text-sm font-semibold text-gray-900 cursor-pointer">
                                            Mark as Urgent Request
                                        </label>
                                        <span className="text-xs text-gray-500 ml-1">(Highlight this campaign for immediate priority)</span>
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                        <Button type="button" variant="ghost" onClick={() => setIsWizardOpen(false)}>Cancel</Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md font-bold" disabled={wizardStatus === "submitting"}>
                                        {wizardStatus === "submitting" ? "Saving..." : editingCampaign ? "Save Changes" : "Submit for Review"}
                                        </Button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

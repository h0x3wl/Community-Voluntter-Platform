import { useEffect, useState, useRef } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Save,
    CreditCard,
    Building,
    Pencil,
    Loader2
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

export function AdminSettingsPage() {
    const { orgId } = useCurrentUser()
    const [activeSection, setActiveSection] = useState("organization")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [orgData, setOrgData] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        website: "",
        phone: "",
        address: "",
        city: "",
        country: ""
    })

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await api.getOrg(orgId)
                if (res?.data) {
                    setOrgData(res.data)
                    setFormData({
                        name: res.data.name || "",
                        description: res.data.description || "",
                        website: res.data.website || "",
                        phone: res.data.phone || "",
                        address: res.data.address || "",
                        city: res.data.city || "",
                        country: res.data.country || ""
                    })
                }
            } catch (err) {
                console.error("Failed to load org settings", err)
            } finally {
                setIsLoading(false)
            }
        }
        if (orgId) {
            fetchOrg()
        }
    }, [orgId])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !orgId) return;

        setIsUploading(true);
        const data = new FormData();
        data.append('logo', file);

        try {
            const res = await api.uploadOrgLogo(orgId, data);
            if (res.data) {
                setOrgData(res.data);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Failed to upload: ${error.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await api.updateOrg(orgId, formData)
            alert("Settings saved successfully!")
            
            // Re-fetch to confirm
            const res = await api.getOrg(orgId)
            if (res?.data) setOrgData(res.data)
        } catch (err: any) {
            alert(err?.message || "Failed to save settings.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {/* Secondary Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-2 sticky top-4">
                <nav className="space-y-1">
                    <button
                        onClick={() => setActiveSection("organization")}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${activeSection === 'organization' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Building className="w-4 h-4" />
                        Organization Profile
                    </button>
                    <button
                        onClick={() => setActiveSection("payment")}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${activeSection === 'payment' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CreditCard className="w-4 h-4" />
                        Payment Gateways
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full space-y-8">

                {/* Header Actions */}
                <div className="flex justify-end">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                {/* Organization Profile Section */}
                {activeSection === "organization" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Organization Profile</h2>
                            <p className="text-sm text-gray-500">Configure your charity identity and contact information.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Charity Identity</h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Logo Placeholder */}
                                    <div className="flex-shrink-0">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Logo</label>
                                        <div onClick={triggerFileInput} className="w-32 h-32 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 relative group cursor-pointer shadow-sm overflow-hidden">
                                            {isUploading ? (
                                                <Loader2 className="w-8 h-8 animate-spin" />
                                            ) : orgData?.logo_url ? (
                                                <img src={orgData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-bold">{(formData.name || orgData?.name || "O").charAt(0).toUpperCase()}</span>
                                            )}
                                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow border border-gray-100 group-hover:scale-110 transition-transform">
                                                <Pencil className="w-4 h-4 text-gray-600" />
                                            </div>
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleFileSelect} 
                                            accept="image/png, image/jpeg" 
                                            className="hidden" 
                                        />
                                    </div>

                                    {/* Form Fields */}
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500">Organization Name</label>
                                            <Input name="name" value={formData.name} onChange={handleInputChange} className="bg-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500">Website</label>
                                            <Input name="website" value={formData.website} onChange={handleInputChange} className="bg-white" placeholder="https://" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500">Phone</label>
                                            <Input name="phone" value={formData.phone} onChange={handleInputChange} className="bg-white" />
                                        </div>
                                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                                            <label className="text-xs font-bold text-gray-500">Mission Statement / Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                                placeholder="Describe your organization's mission..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-900 mb-4">Location Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-1 md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500">Address</label>
                                        <Input name="address" value={formData.address} onChange={handleInputChange} className="bg-white" placeholder="123 Main St" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500">City</label>
                                        <Input name="city" value={formData.city} onChange={handleInputChange} className="bg-white" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500">Country</label>
                                        <Input name="country" value={formData.country} onChange={handleInputChange} className="bg-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Gateways Section */}
                {activeSection === "payment" && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Payment Gateways</h2>
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Systems Online</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Stripe */}
                            <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-48 relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-green-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Connected</div>
                                <div className="w-10 h-10 bg-[#635BFF] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">S</div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Stripe Connect</h4>
                                    <p className="text-xs text-gray-500 mb-4">Process credit card donations</p>
                                </div>
                            </div>

                            {/* PayPal */}
                            <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-48 relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Unlinked</div>
                                <div className="w-10 h-10 bg-[#0070BA] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">P</div>
                                <div>
                                    <h4 className="font-bold text-gray-900">PayPal for Nonprofits</h4>
                                    <p className="text-xs text-gray-500 mb-4">Direct wallet transfers</p>
                                </div>
                            </div>

                            {/* Bank Transfer */}
                            <div className="border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-48 relative overflow-hidden">
                                <div className="absolute top-4 right-4 bg-yellow-50 text-yellow-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Pending</div>
                                <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-4">
                                    <Building className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">Direct Bank Transfer</h4>
                                    <p className="text-xs text-gray-500 mb-4">Wire and ACH transfers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

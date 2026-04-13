import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Search, UserPlus, MoreVertical, Shield, Mail, Phone, Calendar, X, CheckCircle2 } from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

export function AdminTeamPage() {
    const { orgId } = useCurrentUser()
    const [team, setTeam] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isWizardOpen, setIsWizardOpen] = useState(false)
    const [wizardStatus, setWizardStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
    const [wizardError, setWizardError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    const fetchTeam = async () => {
        try {
            const res = await api.getOrgTeam(orgId)
            if (res?.data) setTeam(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            console.error("Failed to fetch team data", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (orgId) fetchTeam()
    }, [orgId])

    const handleInviteMember = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const role = formData.get("role") as string

        setWizardStatus("submitting")
        setWizardError("")
        try {
            await api.inviteOrgMember(orgId, { email, role })
            setWizardStatus("success")
            setTimeout(() => {
                setIsWizardOpen(false)
                setWizardStatus("idle")
                fetchTeam() // Refresh team list
            }, 1500)
        } catch (err: any) {
            setWizardStatus("error")
            setWizardError(err?.message || "Failed to send invitation. Make sure the user has a registered account.")
        }
    }

    const rolesMap: any = {
        'owner': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Owner' },
        'admin': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Admin' },
        'manager': { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Manager' },
        'editor': { bg: 'bg-green-100', text: 'text-green-700', label: 'Editor' },
        'viewer': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Viewer' }
    }

    const filteredTeam = team.filter((member: any) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        const name = `${member.user?.first_name || ""} ${member.user?.last_name || ""}`.toLowerCase()
        return name.includes(q) || (member.user?.email || "").toLowerCase().includes(q)
    })

    return (
        <div className="space-y-8 relative min-h-[400px]">
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <span className="text-gray-500 font-medium">Loading team directory...</span>
                </div>
            )}
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                    <p className="text-gray-500 mt-1">Manage team members, roles, and access controls.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Find team members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 border-gray-200"
                        />
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 h-10"
                        onClick={() => setIsWizardOpen(true)}
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                    </Button>
                </div>
            </div>

            {/* Team Members Grid */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Active Members ({filteredTeam.length})</h2>
                        <p className="text-sm text-gray-500">Users with access to your organization.</p>
                    </div>
                </div>

                {filteredTeam.length === 0 && !isLoading && (
                    <div className="py-12 text-center text-gray-400">
                        {searchQuery ? "No team members match your search." : "No team members found. Invite colleagues to collaborate."}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredTeam.map((member: any, i: number) => {
                        const roleStyle = rolesMap[member.role] || rolesMap['viewer']

                        return (
                            <div key={member.id || i} className="border border-gray-100 rounded-xl p-5 hover:border-blue-100 hover:bg-blue-50/10 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                                            {member.user?.avatar_url ? (
                                                <img src={member.user.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                                            ) : (
                                                (member.user?.first_name?.[0] || "U")
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">
                                                {member.user?.first_name} {member.user?.last_name}
                                            </h3>
                                            <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${roleStyle.bg} ${roleStyle.text}`}>
                                                {roleStyle.label}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="mt-4 space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" />
                                        {member.user?.email || "No email"}
                                    </div>
                                    {member.user?.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" />
                                            {member.user.phone}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-2 mt-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Joined {new Date(member.joined_at || member.created_at || Date.now()).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Invite Member Modal */}
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {wizardStatus === "success" ? (
                            <div className="p-10 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Invitation Sent!</h2>
                                <p className="text-gray-500 mt-2">They will receive an email to join your organization.</p>
                            </div>
                        ) : (
                            <>
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h2 className="text-lg font-bold text-gray-900">Invite Team Member</h2>
                                    <button type="button" onClick={() => { setIsWizardOpen(false); setWizardStatus("idle"); setWizardError("") }} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleInviteMember} className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                        <Input name="email" required type="email" placeholder="colleague@example.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Assign Role</label>
                                        <select name="role" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                            <option value="admin">Administrator (Full Access)</option>
                                            <option value="editor">Editor (Can manage campaigns & donors)</option>
                                            <option value="viewer">Viewer (Read-only access)</option>
                                        </select>
                                    </div>
                                    {wizardError && (
                                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700">
                                            {wizardError}
                                        </div>
                                    )}
                                    <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-sm text-blue-800">
                                        <p><strong>Note:</strong> The user must have a registered account on the platform to accept the invitation.</p>
                                    </div>
                                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                        <Button type="button" variant="ghost" onClick={() => { setIsWizardOpen(false); setWizardStatus("idle"); setWizardError("") }}>Cancel</Button>
                                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 shadow-md font-bold" disabled={wizardStatus === "submitting"}>
                                            {wizardStatus === "submitting" ? "Sending..." : "Send Invite"}
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

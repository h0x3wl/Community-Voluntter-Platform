import { useEffect, useState } from "react"
import { api } from "../../lib/api"
import {
    Trash2,
    ShieldCheck,
    Mail
} from "lucide-react"

export function PlatformAdminUsers() {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await api.getAdminUsers()
            setUsers(res.data || [])
        } catch (err) {
            console.error("Failed to fetch users", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Deactivate this user account?")) return
        try { await api.deleteAdminUser(id); fetchUsers() } catch (err: any) { alert(`Error: ${err.message}`) }
    }

    const roleColors: Record<string, string> = {
        platform_admin: "bg-indigo-100 text-indigo-700",
        org_admin: "bg-emerald-100 text-emerald-700",
        user: "bg-gray-100 text-gray-600",
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500 mt-1">View and manage all registered users on the platform.</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20"><span className="text-gray-400">Loading...</span></div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">No users found.</div>
                ) : (
                    <>
                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                            <span className="col-span-4">User</span>
                            <span className="col-span-3">Email</span>
                            <span className="col-span-2">Role</span>
                            <span className="col-span-1">Points</span>
                            <span className="col-span-2 text-right">Actions</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {users.map((user: any, i: number) => {
                                const role = user.role || "user"
                                const initials = `${(user.first_name || "U").charAt(0)}${(user.last_name || "").charAt(0)}`
                                return (
                                    <div key={user.public_id || i} className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${role === 'platform_admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {initials}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</h4>
                                                <p className="text-[10px] text-gray-400">ID: {user.public_id?.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 flex items-center gap-2 text-xs text-gray-500">
                                            <Mail className="w-3 h-3 text-gray-300" /> {user.email}
                                        </div>
                                        <div className="col-span-2">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${roleColors[role] || roleColors.user}`}>
                                                {role === 'platform_admin' ? 'admin' : role.replace("_", " ")}
                                            </span>
                                        </div>
                                        <div className="col-span-1 text-sm font-bold text-gray-700">{(user.points_balance || 0).toLocaleString()}</div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            {role !== 'platform_admin' ? (
                                                <button onClick={() => handleDelete(user.public_id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Deactivate User">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                                    <ShieldCheck className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

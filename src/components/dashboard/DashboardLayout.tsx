import {
    LayoutDashboard,
    HeartHandshake,
    Shirt,
    AlertCircle,
    FileText,
    Trophy,
    BarChart3,
    User,
    LogOut,
    Bell,
    Search,
    Home,
    CheckCircle2,
    Check,
    XCircle
} from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"
import { api } from "../../lib/api"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/user" },
    { icon: HeartHandshake, label: "My Donations", href: "/user/donations" },
    { icon: Shirt, label: "Donate Clothes", href: "/user/analysis" },
    // { icon: AlertCircle, label: "Urgent Requests", href: "/user/urgent" },
    // { icon: FileText, label: "Applications", href: "/user/applications" },
    { icon: Trophy, label: "Leaderboard", href: "/user/leaderboard" },
    { icon: BarChart3, label: "Impact Tracker", href: "/user/impact" },
    { icon: User, label: "Profile", href: "/user/profile" },
]

export function DashboardLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)

    const refreshUser = async () => {
        try {
            const response = await api.getMe()
            setUser(response.data)
            localStorage.setItem("user", JSON.stringify(response.data))
        } catch (err) {
            // Not authenticated
            localStorage.removeItem("token")
            navigate("/login")
        }
    }

    // Fetch user on mount and refresh when navigating between dashboard pages
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.getMe()
                setUser(response.data)
                localStorage.setItem("user", JSON.stringify(response.data))
                
                // Fetch notifications
                try {
                    const notifRes = await api.getNotifications()
                    if (notifRes.data) {
                        setNotifications(notifRes.data.data)
                        setUnreadCount(notifRes.data.unread_count)
                    }
                } catch (e) {
                    console.error(e)
                }
            } catch (err) {
                localStorage.removeItem("token")
                navigate("/login")
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [navigate, location.pathname])

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault()
        try {
            await api.logout()
        } catch(e) {
            // ignore
        }
        localStorage.removeItem("token")
        navigate("/login")
    }

    const handleMarkAllRead = async () => {
        try {
            await api.markNotificationsRead()
            setUnreadCount(0)
            setNotifications(notifications.map(n => ({...n, read_at: new Date().toISOString()})))
        } catch (e) {
            console.error(e)
        }
    }

    const handleInviteResponse = async (notificationId: string, action: 'accept' | 'reject') => {
        try {
            await api.respondToOrgInvite(notificationId, action)
            // Update the notification locally
            setNotifications(notifications.map(n => 
                n.id === notificationId 
                    ? { ...n, read_at: new Date().toISOString(), data: { ...n.data, responded: action } }
                    : n
            ))
            setUnreadCount(Math.max(0, unreadCount - 1))
        } catch (e: any) {
            alert("Failed: " + (e?.message || "Unknown error"))
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-slate-900">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-blue-500/20 animate-spin"></div>
                    <p>Loading Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-50 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-12 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        Awn
                    </div>
                    <span className="font-bold text-lg">Awn عَوْن</span>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-1">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <a
                        href="#"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </a>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="font-semibold text-gray-900">Dashboard</div>

                    <div className="flex items-center gap-6">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search campaigns..."
                                className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white transition-all rounded-lg"
                            />
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-gray-500">No notifications yet.</div>
                                        ) : (
                                            <div className="divide-y divide-gray-50">
                                                {notifications.map((n: any) => (
                                                    <div key={n.id} className={cn("p-4 flex gap-3 hover:bg-gray-50 transition-colors", !n.read_at && "bg-blue-50/30")}>
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                            <Bell className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-900 leading-tight mb-1">{n.data?.title || 'Notification'}</p>
                                                            <p className="text-xs text-gray-500 mb-2">{n.data?.message || ''}</p>
                                                            {n.data?.type === 'org_invite' && !n.data?.responded && !n.read_at && (
                                                                <div className="flex gap-2 mt-2">
                                                                    <button 
                                                                        onClick={() => handleInviteResponse(n.id, 'accept')}
                                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors"
                                                                    >
                                                                        <Check className="w-3 h-3" /> Accept
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleInviteResponse(n.id, 'reject')}
                                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors"
                                                                    >
                                                                        <XCircle className="w-3 h-3" /> Decline
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {n.data?.responded && (
                                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${n.data.responded === 'accept' ? 'text-green-600' : 'text-red-500'}`}>
                                                                    {n.data.responded === 'accept' ? '✓ Accepted' : '✗ Declined'}
                                                                </span>
                                                            )}
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        {!n.read_at && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <img
                                src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=3b82f6&color=fff`}
                                alt={user?.first_name}
                                className="w-9 h-9 rounded-full object-cover"
                            />
                            <div className="hidden md:block text-sm">
                                <p className="font-medium text-gray-900 leading-none">{user?.first_name} {user?.last_name}</p>
                                <p className="text-gray-500 text-xs mt-0.5 capitalize">{user?.role || 'Donor'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    <Outlet context={{ user, refreshUser }} />
                </main>

                {/* Footer */}
                <footer className="px-8 py-6 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <p>© 2026 Awn. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link to="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
                            <Link to="/terms" className="hover:text-gray-600">Terms of Service</Link>
                            <Link to="/contact" className="hover:text-gray-600">Help Center</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}

import {
    LayoutDashboard,
    HeartHandshake,
    Sparkles,
    AlertCircle,
    FileText,
    Trophy,
    BarChart3,
    User,
    LogOut,
    Bell,
    Search,
    ChevronDown,
    Home
} from "lucide-react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"
import { api } from "../../lib/api"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/user" },
    { icon: HeartHandshake, label: "My Donations", href: "/user/donations" },
    { icon: Sparkles, label: "AI Analysis", href: "/user/analysis" },
    { icon: AlertCircle, label: "Urgent Requests", href: "/user/urgent" },
    { icon: FileText, label: "Applications", href: "/user/applications" },
    { icon: Trophy, label: "Leaderboard", href: "/user/leaderboard" },
    { icon: BarChart3, label: "Impact Tracker", href: "/user/impact" },
    { icon: User, label: "Profile", href: "/user/profile" },
]

export function DashboardLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

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

                        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

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
                            <ChevronDown className="w-4 h-4 text-gray-400" />
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

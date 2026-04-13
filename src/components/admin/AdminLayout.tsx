import {
    LayoutDashboard,
    PieChart,
    Users,
    Megaphone,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronDown,
    Building,
    Home,
    AlertTriangle
} from "lucide-react"
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"
import { api } from "../../lib/api"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/org" },
    { icon: PieChart, label: "Finance", href: "/org/finance" },
    { icon: Users, label: "Donors", href: "/org/donors" },
    { icon: Megaphone, label: "Campaigns", href: "/org/campaigns" },
    { icon: Building, label: "Team", href: "/org/team" },
    { icon: Settings, label: "Settings", href: "/org/settings" },
]

export function AdminLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!token) {
            setIsLoading(false)
            return
        }

        const fetchUser = async () => {
            try {
                const response = await api.getMe()
                const userData = response.data
                setUser(userData)
                localStorage.setItem("user", JSON.stringify(userData))
            } catch (err) {
                console.error("Failed to fetch user for org layout", err)
                // Fall back to localStorage
                const cached = localStorage.getItem("user")
                if (cached) {
                    try { setUser(JSON.parse(cached)) } catch {}
                }
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [token])

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans text-slate-900">
                <div className="flex flex-col items-center gap-4 text-gray-500">
                    <div className="w-8 h-8 rounded-full border-4 border-t-green-500 border-green-500/20 animate-spin"></div>
                    <p>Loading Organization Portal...</p>
                </div>
            </div>
        )
    }

    if (!user?.org_public_id) {
        return <Navigate to="/user" replace />
    }

    const initials = `${(user?.first_name || 'O').charAt(0)}${(user?.last_name || 'M').charAt(0)}`

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-50 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-12 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        Awn
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-tight">Awn عَوْن</span>
                        <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Org Portal</span>
                    </div>
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
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search donors, campaigns, transactions..."
                            className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white transition-all rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200">
                                {initials}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-medium text-gray-900 leading-none">{user?.first_name || 'Org'} {user?.last_name || 'Manager'}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{user?.org_name || 'Organization'}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    {user?.org_status === 'pending' || user?.org_status === 'suspended' ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Review Pending</h2>
                            <p className="text-gray-500 max-w-md mx-auto">
                                Your organization account is currently under review by our platform administrators. 
                                You will have full access to dashboard features once approved.
                            </p>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </main>
            </div>
        </div>
    )
}

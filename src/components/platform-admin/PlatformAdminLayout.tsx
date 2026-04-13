import {
    LayoutDashboard,
    Megaphone,
    Building2,
    Users,
    ShieldCheck,
    LogOut,
    Bell,
    Search,
    ChevronDown,
    Home
} from "lucide-react"
import { Link, Outlet, useLocation, Navigate } from "react-router-dom"
import { cn } from "../../lib/utils"
import { Input } from "../ui/input"

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Megaphone, label: "Campaigns", href: "/admin/campaigns" },
    { icon: Building2, label: "Organizations", href: "/admin/organizations" },
    { icon: Users, label: "Users", href: "/admin/users" },
]

export function PlatformAdminLayout() {
    const location = useLocation()
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    let user: any = null
    try { user = userData ? JSON.parse(userData) : null } catch {}

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== 'platform_admin') {
        return <Navigate to="/user" replace />
    }

    const initials = `${(user?.first_name || 'P').charAt(0)}${(user?.last_name || 'A').charAt(0)}`

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 fixed h-full z-50 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg leading-tight">Awn عَوْن</span>
                        <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Platform Admin</span>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => {
                        const isActive = location.pathname === item.href ||
                            (item.href !== "/admin" && location.pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600"
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
                    <Link
                        to="/login"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search campaigns, users, orgs..."
                            className="pl-9 h-10 bg-gray-50 border-transparent focus:bg-white transition-all rounded-lg"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white" />
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                {initials}
                            </div>
                            <div className="hidden md:block text-sm">
                                <p className="font-medium text-gray-900 leading-none">{user?.first_name || 'Platform'} {user?.last_name || 'Admin'}</p>
                                <p className="text-gray-500 text-xs mt-0.5">Super Admin</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

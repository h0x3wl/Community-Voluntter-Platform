import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { Heart, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"

export function Header() {
    const scrollToTop = () => {
        window.scrollTo(0, 0)
    }

    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userRole, setUserRole] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        const userData = localStorage.getItem("user")
        setIsLoggedIn(!!token)
        if (userData) {
            try {
                const parsed = JSON.parse(userData)
                setUserRole(parsed.role || "user")
            } catch { setUserRole("user") }
        }
    }, [])

    const getDashboardLink = () => {
        if (userRole === "platform_admin") return "/admin"
        if (userRole === "org_admin") return "/org"
        return "/user"
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setIsLoggedIn(false)
        setUserRole("")
    }

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="container mx-auto h-16 px-4 sm:px-6 lg:px-8 relative flex items-center justify-between">
                {/* Left: Logo */}
                <Link to="/" className="flex items-center gap-2 flex-shrink-0 z-10" onClick={scrollToTop}>
                    <Heart className="h-6 w-6 text-blue-600 fill-blue-600" />
                    <span className="text-xl font-bold tracking-tight text-gray-900">Awn عَوْن</span>
                </Link>

                {/* Center: Nav — absolutely centered */}
                <nav className="hidden md:flex gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link to="/campaigns" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={scrollToTop}>Our Causes</Link>
                    <Link to="/volunteer" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={scrollToTop}>Get Involved</Link>
                    <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors" onClick={scrollToTop}>Contact</Link>
                </nav>

                {/* Right: Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0 z-10">
                    {isLoggedIn ? (
                        <>
                            <Link to={getDashboardLink()} onClick={scrollToTop}>
                                <Button variant="ghost" className="font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                                    <User className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/" onClick={() => { scrollToTop(); handleLogout(); }}>
                                <Button variant="ghost" className="font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={scrollToTop}>
                                <Button variant="ghost" className="font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50">Log In</Button>
                            </Link>
                            <Link to="/donate" onClick={scrollToTop}>
                                <Button className="font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">Donate</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

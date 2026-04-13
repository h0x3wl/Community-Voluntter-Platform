import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api } from "../../lib/api"

export function LoginForm() {
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")
        setIsLoading(true)

        try {
            const response = await api.login({ email, password })
            
            // On success, store the returned token and user data
            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("user", JSON.stringify(response.data.user))
                
                // Redirect based on user role
                const role = response.data.user?.role
                if (role === "platform_admin") {
                    navigate("/admin")
                } else if (role === "org_admin") {
                    navigate("/org")
                } else {
                    navigate("/user")
                }
            } else {
                setErrorMsg("Received invalid response from server.")
            }
        } catch (error: any) {
            setErrorMsg(error.message || "Invalid credentials. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">Awn Connect</h1>
                <Link to="/" className="text-sm font-medium text-gray-600 hover:text-primary flex items-center">
                    Back to Home &rarr;
                </Link>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back</h2>
                <p className="text-gray-500">
                    Please enter your details to access your dashboard and track your impact.
                </p>
            </div>

            {errorMsg && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="you@example.com" 
                        className="h-12 bg-gray-50 border-gray-200" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="Enter your password" 
                        className="h-12 bg-gray-50 border-gray-200" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="remember"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="remember" className="text-sm font-medium text-gray-600">Remember me</label>
                    </div>
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-500 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold shadow-blue-500/20 shadow-lg">
                    {isLoading ? "Logging in..." : "Log In"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 font-medium bg-white hover:bg-gray-50 border-gray-200 text-gray-700">
                    {/* Google Icon SVG */}
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </Button>
                <Button variant="outline" className="h-12 font-medium bg-white hover:bg-gray-50 border-gray-200 text-gray-700">
                    {/* Apple Icon */}
                    <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 384 512">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                    </svg>
                    Apple
                </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
                Don't have an account? <Link to="/register" className="text-blue-500 hover:underline font-medium">Join us today</Link>
            </div>

            <div className="text-center text-xs text-gray-400 mt-8 flex items-center justify-center gap-2">
                {/* Lock icon */}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your data is processed securely.
            </div>
        </div>
    )
}

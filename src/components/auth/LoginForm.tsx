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

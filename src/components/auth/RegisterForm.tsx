import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, HandHeart, Building2 } from "lucide-react"
import { cn } from "../../lib/utils"
import { api } from "../../lib/api"

export function RegisterForm() {
    const [userType, setUserType] = useState<"donor" | "org">("donor")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    // Organization verification fields
    const [orgName, setOrgName] = useState("")
    const [orgType, setOrgType] = useState("")
    const [taxId, setTaxId] = useState("")
    const [licenseNumber, setLicenseNumber] = useState("")
    const [orgWebsite, setOrgWebsite] = useState("")
    const [orgPhone, setOrgPhone] = useState("")
    const [orgAddress, setOrgAddress] = useState("")
    const [orgCity, setOrgCity] = useState("")
    const [orgCountry, setOrgCountry] = useState("")

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")
        setIsLoading(true)

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.")
            setIsLoading(false)
            return
        }

        // Validate org fields when registering as org_admin
        if (userType === "org") {
            if (!orgName.trim()) {
                setErrorMsg("Organization name is required.")
                setIsLoading(false)
                return
            }
            if (!taxId.trim()) {
                setErrorMsg("Tax ID / Registration Number is required for verification.")
                setIsLoading(false)
                return
            }
            if (!orgPhone.trim()) {
                setErrorMsg("Organization phone number is required.")
                setIsLoading(false)
                return
            }
        }

        try {
            const mappedAccountType = userType === "donor" ? "user" : "org_admin"
            
            const response = await api.register({
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                password_confirmation: confirmPassword,
                account_type: mappedAccountType
            })
            
            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("user", JSON.stringify(response.data.user))

                // If org_admin, create the organization
                if (userType === "org") {
                    try {
                        let formattedWebsite = orgWebsite
                        if (formattedWebsite && !formattedWebsite.match(/^https?:\/\//)) {
                            formattedWebsite = `https://${formattedWebsite}`
                        }

                        const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
                        await api.createOrganization({
                            name: orgName,
                            slug: slug || `org-${Date.now()}`,
                            description: "",
                            website: formattedWebsite || null,
                            phone: orgPhone || null,
                            address: orgAddress || null,
                            city: orgCity || null,
                            country: orgCountry || null,
                            tax_id: taxId || null,
                            license_number: licenseNumber || null,
                            org_type: orgType || null,
                        })

                        // Refresh the user data to get the new org_public_id
                        try {
                            const meRes = await api.getMe();
                            if (meRes.data) {
                                localStorage.setItem("user", JSON.stringify(meRes.data));
                            }
                        } catch (refreshErr) {
                            console.warn("Could not refresh user profile after org creation:", refreshErr)
                        }

                        // Go directly to org portal (shows pending approval message)
                        navigate("/org")
                        return
                    } catch (orgError: any) {
                        console.error("Organization creation failed:", orgError)
                        const msg = (orgError as any).errors 
                            ? Object.values((orgError as any).errors).flat().join(" ") 
                            : orgError.message;
                        setErrorMsg(`User account created, but organization failed: ${msg}`)
                        setIsLoading(false)
                        return // Don't navigate to success if org creation failed
                    }
                }

                navigate("/register-success")
            } else {
                setErrorMsg("Received invalid response from server.")
            }
        } catch (error: any) {
            // Check for Laravel validation errors
            if (error.errors) {
                const messages = Object.values(error.errors).flat().join(" ")
                setErrorMsg(messages)
            } else {
                setErrorMsg(error.message || "Failed to create account. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-lg space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Join Our Mission</h1>
                <p className="text-gray-500">
                    Create an account to track your donations and impact.
                </p>
            </div>

            {errorMsg && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-4">
                <label className="text-sm font-medium text-gray-900">I want to join as a:</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    <button
                        onClick={(e) => { e.preventDefault(); setUserType("donor"); }}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
                            userType === "donor"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <HandHeart className="w-4 h-4" />
                        Donor / Volunteer
                    </button>
                    <button
                        onClick={(e) => { e.preventDefault(); setUserType("org"); }}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all",
                            userType === "org"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Building2 className="w-4 h-4" />
                        Org Admin
                    </button>
                </div>
            </div>

            <form className="space-y-5" onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="firstName">First Name</label>
                        <Input 
                            id="firstName" 
                            placeholder="Jane" 
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="lastName">Last Name</label>
                        <Input 
                            id="lastName" 
                            placeholder="Doe" 
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="jane@example.com" 
                        className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="h-12 bg-gray-50 border-gray-200 rounded-xl pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700" htmlFor="confirm">Confirm</label>
                        <Input 
                            id="confirm" 
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 bg-gray-50 border-gray-200 rounded-xl"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Organization Verification Fields — shown only for Org Admin */}
                {userType === "org" && (
                    <div className="space-y-5 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-blue-900">Organization Verification</h3>
                        </div>
                        <p className="text-xs text-blue-600 -mt-3 mb-2">
                            This information will be reviewed by our team to verify your organization.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Organization Name <span className="text-red-400">*</span></label>
                            <Input
                                placeholder="e.g. Hope Foundation"
                                className="h-12 bg-white border-gray-200 rounded-xl"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Organization Type</label>
                            <select
                                className="flex h-12 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={orgType}
                                onChange={(e) => setOrgType(e.target.value)}
                            >
                                <option value="">Select type...</option>
                                <option value="ngo">NGO</option>
                                <option value="foundation">Foundation</option>
                                <option value="social_enterprise">Social Enterprise</option>
                                <option value="cooperative">Cooperative</option>
                                <option value="charity">Charity</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tax ID / Reg. Number <span className="text-red-400">*</span></label>
                                <Input
                                    placeholder="e.g. EIN 12-3456789"
                                    className="h-12 bg-white border-gray-200 rounded-xl"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">License Number</label>
                                <Input
                                    placeholder="Optional"
                                    className="h-12 bg-white border-gray-200 rounded-xl"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Website</label>
                                <Input
                                    type="url"
                                    placeholder="https://example.org"
                                    className="h-12 bg-white border-gray-200 rounded-xl"
                                    value={orgWebsite}
                                    onChange={(e) => setOrgWebsite(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone <span className="text-red-400">*</span></label>
                                <Input
                                    placeholder="+1 (555) 123-4567"
                                    className="h-12 bg-white border-gray-200 rounded-xl"
                                    value={orgPhone}
                                    onChange={(e) => setOrgPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Address</label>
                            <Input
                                placeholder="Street address"
                                className="h-12 bg-white border-gray-200 rounded-xl"
                                value={orgAddress}
                                onChange={(e) => setOrgAddress(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <Input
                                    placeholder="City"
                                    className="h-12 bg-white border-gray-200 rounded-xl"
                                    value={orgCity}
                                    onChange={(e) => setOrgCity(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <Input
                                    placeholder="Country"
                                    className="h-12 bg-white border-gray-200 rounded-xl"
                                    value={orgCountry}
                                    onChange={(e) => setOrgCountry(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-start space-x-3 pt-2">
                    <input
                        type="checkbox"
                        id="terms"
                        required
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-500 leading-tight">
                        I agree to the <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                    </label>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg shadow-cyan-500/20">
                    {isLoading ? "Creating Account..." : "Create Account \u2192"}
                </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or register with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-12 font-medium bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-full">
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                </Button>
                <Button variant="outline" className="h-12 font-medium bg-white hover:bg-gray-50 border-gray-200 text-gray-700 rounded-full">
                    <svg className="mr-2 h-5 w-5 fill-current" viewBox="0 0 384 512">
                        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
                    </svg>
                    Apple
                </Button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-4">
                Already have an account? <Link to="/login" className="text-cyan-500 hover:underline font-medium">Log In</Link>
            </div>
        </div>
    )
}

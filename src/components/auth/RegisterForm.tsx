import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, HandHeart, Building2, Upload, UserCheck, X, FileText } from "lucide-react"
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

    // Legal documentation & authorized representative
    const [legalDocument, setLegalDocument] = useState<File | null>(null)
    const [authorizedRepName, setAuthorizedRepName] = useState("")
    const [authorizedRepId, setAuthorizedRepId] = useState("")

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
            if (!authorizedRepName.trim()) {
                setErrorMsg("Authorized representative name is required.")
                setIsLoading(false)
                return
            }
            if (!authorizedRepId.trim()) {
                setErrorMsg("Authorized representative ID is required.")
                setIsLoading(false)
                return
            }
            if (!legalDocument) {
                setErrorMsg("Legal documentation is required for organization verification.")
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
                        const formData = new FormData()
                        formData.append('name', orgName)
                        formData.append('slug', slug || `org-${Date.now()}`)
                        formData.append('description', '')
                        if (formattedWebsite) formData.append('website', formattedWebsite)
                        if (orgPhone) formData.append('phone', orgPhone)
                        if (orgAddress) formData.append('address', orgAddress)
                        if (orgCity) formData.append('city', orgCity)
                        if (orgCountry) formData.append('country', orgCountry)
                        if (taxId) formData.append('tax_id', taxId)
                        if (licenseNumber) formData.append('license_number', licenseNumber)
                        if (orgType) formData.append('org_type', orgType)
                        if (authorizedRepName) formData.append('authorized_rep_name', authorizedRepName)
                        if (authorizedRepId) formData.append('authorized_rep_id', authorizedRepId)
                        if (legalDocument) formData.append('legal_document', legalDocument)

                        await api.createOrganization(formData)

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
                                    placeholder="e.g. LIC-2024-00123"
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

                        {/* Authorized Representative */}
                        <div className="space-y-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-semibold text-blue-900">Authorized Representative</h4>
                            </div>
                            <p className="text-xs text-blue-600 -mt-1">
                                The person legally responsible for the organization.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-400">*</span></label>
                                    <Input
                                        placeholder="e.g. Ahmed Ali"
                                        className="h-12 bg-white border-gray-200 rounded-xl"
                                        value={authorizedRepName}
                                        onChange={(e) => setAuthorizedRepName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">National / Passport ID <span className="text-red-400">*</span></label>
                                    <Input
                                        placeholder="e.g. 29901011234567"
                                        className="h-12 bg-white border-gray-200 rounded-xl"
                                        value={authorizedRepId}
                                        onChange={(e) => setAuthorizedRepId(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Legal Documentation Upload */}
                        <div className="space-y-3 pt-3 border-t border-blue-200">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-semibold text-blue-900">Legal Documentation <span className="text-red-400">*</span></h4>
                            </div>
                            <p className="text-xs text-blue-600 -mt-1">
                                Upload a registration certificate, license, or legal proof (PDF, JPG, PNG, DOC — max 10MB).
                            </p>
                            {!legalDocument ? (
                                <label
                                    htmlFor="legalDocUpload"
                                    className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-blue-200 rounded-xl bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                >
                                    <Upload className="w-8 h-8 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-600">Click to upload document</span>
                                    <span className="text-xs text-gray-400">PDF, JPG, PNG, DOC up to 10MB</span>
                                    <input
                                        id="legalDocUpload"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                if (file.size > 10 * 1024 * 1024) {
                                                    setErrorMsg("Legal document must be under 10MB.")
                                                    return
                                                }
                                                setLegalDocument(file)
                                            }
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-xl">
                                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{legalDocument.name}</p>
                                        <p className="text-xs text-gray-400">{(legalDocument.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setLegalDocument(null)}
                                        className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
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



            <div className="text-center text-sm text-gray-500 pt-4">
                Already have an account? <Link to="/login" className="text-cyan-500 hover:underline font-medium">Log In</Link>
            </div>
        </div>
    )
}

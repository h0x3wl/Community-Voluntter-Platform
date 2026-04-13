import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { User, Shield, Bell, Plus, Mail, MessageSquare, BellRing, Trophy } from "lucide-react"
import { useOutletContext } from "react-router-dom"
import { api } from "../../lib/api"

export function ProfileSettingsPage() {
    const { user: currentUser } = useOutletContext<{ user: any }>()
    const [activeTab, setActiveTab] = useState("personal")
    const [notifications, setNotifications] = useState({ email: true, sms: false, push: true })
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')

    const [formData, setFormData] = useState({
        first_name: currentUser?.first_name || '',
        last_name: currentUser?.last_name || '',
        phone: currentUser?.phone || '',
    })

    const toggleNotification = (type: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [type]: !prev[type] }))
        // Optionally would fire api update for notifications here inline
    }

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage('')
        try {
            if (activeTab === 'personal') {
                await api.updateMe(formData)
                setMessage('Personal details saved.')
            } else if (activeTab === 'security') {
                if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
                    setMessage('Please fill in all password fields.')
                    return
                }
                
                await api.updateMePassword(passwordData)
                setMessage('Password updated successfully.')
                setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' })
            }
            setTimeout(() => setMessage(''), 3000)
        } catch (error: any) {
            console.error(error)
            const validationErrors = error.errors ? Object.values(error.errors).flat().join(" ") : error.message;
            setMessage(`Failed: ${validationErrors || 'Please check your inputs'}`)
            setTimeout(() => setMessage(''), 5000)
        } finally {
            setIsSaving(false)
        }
    }

    // fallback initials
    const initials = (currentUser?.first_name?.[0] || '') + (currentUser?.last_name?.[0] || '')

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                    <span>Dashboard</span> / <span className="text-gray-900 font-medium">Settings</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

                <div className="flex gap-8 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab("personal")}
                        className={`pb-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'personal' ? 'border-blue-500 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                        <User className="w-4 h-4" /> Personal Info
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        className={`pb-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'security' ? 'border-blue-500 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                        <Shield className="w-4 h-4" /> Security
                    </button>
                    <button
                        onClick={() => setActiveTab("notifications")}
                        className={`pb-4 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${activeTab === 'notifications' ? 'border-blue-500 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                    >
                        <Bell className="w-4 h-4" /> Notifications
                    </button>
                </div>
            </div>

            <div className="space-y-10 max-w-4xl relative">
                {activeTab === "personal" && (
                    <>
                        {/* Profile Picture */}
                        <section className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden text-2xl font-bold text-blue-600">
                                    {currentUser?.avatar_url ? (
                                        <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{initials || <User className="w-8 h-8 opacity-50" />}</span>
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm hover:bg-blue-600 transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">Your Profile Picture</h3>
                                <p className="text-xs text-gray-500 mb-4 max-w-xs">A personal touch helps organizations and fellow donors recognize you. PNG or JPG, max 5MB.</p>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="h-9 px-4 text-xs font-semibold bg-gray-50 border-gray-200">Replace Photo</Button>
                                    <Button variant="ghost" className="h-9 px-4 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-50">Remove</Button>
                                </div>
                            </div>
                        </section>

                        {/* Badges & Achievements */}
                        {currentUser?.badges && currentUser.badges.length > 0 && (
                            <section className="mb-10">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    Badges & Achievements
                                </h2>
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-wrap gap-4">
                                    {currentUser.badges.map((badge: any) => (
                                        <div key={badge.code} className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-white to-orange-50/30 w-36 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
                                            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="w-14 h-14 rounded-full overflow-hidden shadow-sm bg-white p-1 mb-3 border border-orange-100">
                                                <img src={badge.icon_url || `https://ui-avatars.com/api/?name=${badge.name}&background=ffedd5&color=ea580c`} alt={badge.name} className="w-full h-full object-cover rounded-full" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-900 text-center leading-tight">{badge.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Personal Details */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Details</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">First Name</label>
                                        <Input name="first_name" value={formData.first_name} onChange={handleChange} className="bg-gray-50/50 border-gray-200 focus:bg-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Last Name</label>
                                        <Input name="last_name" value={formData.last_name} onChange={handleChange} className="bg-gray-50/50 border-gray-200 focus:bg-white" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
                                        <Input defaultValue={currentUser?.email || ''} disabled className="bg-gray-100 border-transparent text-gray-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Phone Number</label>
                                        <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 000-0000" className="bg-gray-50/50 border-gray-200 focus:bg-white" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </>
                )}

                {activeTab === "security" && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                            <h3 className="font-bold text-gray-900 text-sm">Change Password</h3>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current Password</label>
                                <Input name="current_password" type="password" value={passwordData.current_password} onChange={handlePasswordChange} placeholder="********" className="bg-gray-50/50 border-gray-200 focus:bg-white" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">New Password</label>
                                <Input name="new_password" type="password" value={passwordData.new_password} onChange={handlePasswordChange} placeholder="********" className="bg-gray-50/50 border-gray-200 focus:bg-white" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Confirm New Password</label>
                                <Input name="new_password_confirmation" type="password" value={passwordData.new_password_confirmation} onChange={handlePasswordChange} placeholder="********" className="bg-gray-50/50 border-gray-200 focus:bg-white" />
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === "notifications" && (
                    <section>
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-8">

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">Email Notifications</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Receive receipts and impact reports.</p>
                                </div>
                                <div
                                    onClick={() => toggleNotification('email')}
                                    className={`w-11 h-6 rounded-full px-1 py-1 cursor-pointer flex transition-colors ${notifications.email ? 'bg-blue-500 justify-end' : 'bg-gray-200 justify-start'}`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 flex-shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">SMS Alerts</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Real-time updates for urgent campaigns.</p>
                                </div>
                                <div
                                    onClick={() => toggleNotification('sms')}
                                    className={`w-11 h-6 rounded-full px-1 py-1 cursor-pointer flex transition-colors ${notifications.sms ? 'bg-green-500 justify-end' : 'bg-gray-200 justify-start'}`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">Push Notifications</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">Stay updated via browser and mobile app.</p>
                                </div>
                                <div
                                    onClick={() => toggleNotification('push')}
                                    className={`w-11 h-6 rounded-full px-1 py-1 cursor-pointer flex transition-colors ${notifications.push ? 'bg-blue-500 justify-end' : 'bg-gray-200 justify-start'}`}
                                >
                                    <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>

                        </div>
                    </section>
                )}
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:pl-72 z-10 flex flex-col md:flex-row justify-center md:justify-end items-center gap-4 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-2 mr-auto text-xs text-gray-400">
                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">i</span>
                    Some changes may take up to 24h to reflect publicly.
                </div>
                {message && <span className="text-sm font-semibold text-green-600 animate-pulse mr-4">{message}</span>}
                <div className="flex gap-4">
                    <Button variant="outline" className="text-gray-600 font-semibold border-gray-200">Discard Changes</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-500 hover:bg-blue-600 font-semibold shadow-lg shadow-blue-500/20">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

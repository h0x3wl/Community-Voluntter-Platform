import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    Users,
    Heart,
    Search,
    Filter,
    Download,
    ArrowUpRight,
    DollarSign
} from "lucide-react"
import { api } from "../../lib/api"
import { useCurrentUser } from "../../hooks/useCurrentUser"

export function AdminDonorsPage() {
    const { orgId } = useCurrentUser()
    const [donors, setDonors] = useState<any[]>([])
    const [overview, setOverview] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [donorRes, overRes] = await Promise.all([
                    api.getOrgDonors(orgId).catch(() => null),
                    api.getOrgOverview(orgId).catch(() => null)
                ])
                if (donorRes?.data) {
                    const donorData = donorRes.data.recent_donors || donorRes.data;
                    setDonors(Array.isArray(donorData) ? donorData : [])
                }
                if (overRes?.data) setOverview(overRes.data)
            } catch (err) {
                console.error("Failed to fetch donor page data", err)
            } finally {
                setIsLoading(false)
            }
        }
        if (orgId) fetchAll()
    }, [orgId])

    const totalDonors = overview?.active_donors || donors.length
    const totalRaised = donors.reduce((sum: number, d: any) => sum + (d.total_cents || 0), 0)

    const filteredDonors = donors.filter((d: any) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (d.donor_name || "").toLowerCase().includes(q) || (d.donor_email || "").toLowerCase().includes(q)
    })

    return (
        <div className="space-y-8 relative min-h-[400px]">
             {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <span className="text-gray-500 font-medium">Loading donors data...</span>
                </div>
            )}
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Donors</h1>
                    <p className="text-gray-500 mt-1">View and track your organization's supporter base.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Donors</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">{totalDonors.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Raised</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">${(totalRaised / 100).toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active This Month</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">{overview?.active_donors || 0}</h3>
                            {overview?.active_donors > 0 && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
                                    <ArrowUpRight className="w-3 h-3 mr-0.5" /> Active
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Heart className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Donors List Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Controls */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="h-10 border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Table Header */}
                <div className="bg-blue-50/30 px-6 py-3 border-b border-gray-100 flex justify-between text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <span>Donor</span>
                    <span>Total Donated</span>
                </div>

                {/* List Items */}
                <div className="divide-y divide-gray-100">
                    {filteredDonors.length === 0 && !isLoading && (
                        <div className="px-6 py-12 text-center text-gray-400">
                            {searchQuery ? "No donors match your search." : "No donations received yet. Share your campaigns to start receiving donations!"}
                        </div>
                    )}
                    {filteredDonors.map((donor: any, i: number) => {
                        const totalAmount = (donor.total_cents || 0) / 100

                        return (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        {(donor.donor_name || "A").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {donor.donor_name || "Anonymous Donor"}
                                        </h4>
                                        <p className="text-xs text-gray-500">{donor.donor_email || "No email provided"}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-sm font-semibold text-gray-900">${totalAmount.toLocaleString()}</h4>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-500">Showing {filteredDonors.length} of {donors.length} donors</p>
                </div>
            </div>
        </div>
    )
}
